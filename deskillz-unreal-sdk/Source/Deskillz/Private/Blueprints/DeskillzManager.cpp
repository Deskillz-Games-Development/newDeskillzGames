// Copyright Deskillz Games. All Rights Reserved.

#include "Blueprints/DeskillzManager.h"
#include "Core/DeskillzSDK.h"
#include "Deskillz.h"
#include "Engine/World.h"
#include "Engine/GameInstance.h"
#include "Kismet/GameplayStatics.h"

// Singleton instance
ADeskillzManager* ADeskillzManager::Instance = nullptr;

ADeskillzManager::ADeskillzManager()
{
	PrimaryActorTick.bCanEverTick = true;
	PrimaryActorTick.bStartWithTickEnabled = true;
	
	// Sensible defaults for zero-config setup
	bAutoInitialize = true;
	bUseBuiltInUI = true;
	bPersistAcrossLevels = true;
	bShowDebugInfo = false;
}

ADeskillzManager* ADeskillzManager::Get(const UObject* WorldContextObject)
{
	// Return existing instance
	if (Instance && Instance->IsValidLowLevel() && !Instance->IsPendingKillPending())
	{
		return Instance;
	}
	
	// Try to find existing in world
	if (WorldContextObject)
	{
		if (UWorld* World = WorldContextObject->GetWorld())
		{
			TArray<AActor*> FoundManagers;
			UGameplayStatics::GetAllActorsOfClass(World, ADeskillzManager::StaticClass(), FoundManagers);
			
			if (FoundManagers.Num() > 0)
			{
				Instance = Cast<ADeskillzManager>(FoundManagers[0]);
				return Instance;
			}
			
			// Auto-spawn if none exists
			FActorSpawnParameters SpawnParams;
			SpawnParams.Name = TEXT("DeskillzManager_AutoSpawned");
			SpawnParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
			
			Instance = World->SpawnActor<ADeskillzManager>(ADeskillzManager::StaticClass(), FVector::ZeroVector, FRotator::ZeroRotator, SpawnParams);
			
			if (Instance)
			{
				UE_LOG(LogDeskillz, Log, TEXT("Auto-spawned DeskillzManager"));
			}
			
			return Instance;
		}
	}
	
	return nullptr;
}

bool ADeskillzManager::IsManagerAvailable()
{
	return Instance && Instance->IsValidLowLevel() && !Instance->IsPendingKillPending();
}

void ADeskillzManager::BeginPlay()
{
	Super::BeginPlay();
	
	// Set as singleton
	if (Instance && Instance != this)
	{
		UE_LOG(LogDeskillz, Warning, TEXT("Multiple DeskillzManagers detected! Destroying duplicate."));
		Destroy();
		return;
	}
	
	Instance = this;
	
	// Persist across level loads
	if (bPersistAcrossLevels)
	{
		SetLifeSpan(0); // Don't auto-destroy
		// Note: In UE5, use SetActorTickEnabled and manage lifecycle manually
		// For cross-level persistence, consider using GameInstance subsystem instead
	}
	
	// Get SDK from GameInstance
	if (UGameInstance* GameInstance = GetGameInstance())
	{
		SDK = GameInstance->GetSubsystem<UDeskillzSDK>();
	}
	
	if (SDK)
	{
		BindSDKEvents();
		
		// Auto-initialize if enabled
		if (bAutoInitialize)
		{
			Initialize();
		}
	}
	else
	{
		UE_LOG(LogDeskillz, Error, TEXT("DeskillzManager: Could not get SDK subsystem!"));
	}
	
	UE_LOG(LogDeskillz, Log, TEXT("DeskillzManager BeginPlay - AutoInit: %s, BuiltInUI: %s"), 
		bAutoInitialize ? TEXT("Yes") : TEXT("No"),
		bUseBuiltInUI ? TEXT("Yes") : TEXT("No"));
}

void ADeskillzManager::EndPlay(const EEndPlayReason::Type EndPlayReason)
{
	if (Instance == this)
	{
		Instance = nullptr;
	}
	
	Super::EndPlay(EndPlayReason);
}

void ADeskillzManager::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);
	
	// Update match time every second
	if (SDK && SDK->IsInMatch())
	{
		MatchTimeUpdateTimer += DeltaTime;
		if (MatchTimeUpdateTimer >= 1.0f)
		{
			MatchTimeUpdateTimer = 0.0f;
			OnMatchTimeUpdate.Broadcast(SDK->GetRemainingTime(), SDK->GetElapsedTime());
		}
	}
	
	// Debug display
	if (bShowDebugInfo && GEngine)
	{
		FString DebugInfo = FString::Printf(TEXT("Deskillz SDK v%s\n"), *UDeskillzSDK::GetSDKVersion());
		
		if (SDK)
		{
			DebugInfo += FString::Printf(TEXT("State: %s\n"), 
				SDK->IsReady() ? TEXT("Ready") : TEXT("Not Ready"));
			DebugInfo += FString::Printf(TEXT("Authenticated: %s\n"), 
				SDK->IsAuthenticated() ? TEXT("Yes") : TEXT("No"));
			
			if (SDK->IsInMatch())
			{
				DebugInfo += FString::Printf(TEXT("In Match: Yes\n"));
				DebugInfo += FString::Printf(TEXT("Time: %.1fs / Score: %lld\n"), 
					SDK->GetElapsedTime(), SDK->GetCurrentScore());
			}
			else if (SDK->IsInPractice())
			{
				DebugInfo += TEXT("Mode: Practice\n");
			}
			else if (SDK->IsInMatchmaking())
			{
				DebugInfo += TEXT("Status: Matchmaking...\n");
			}
		}
		
		GEngine->AddOnScreenDebugMessage(-1, 0.0f, FColor::Cyan, DebugInfo);
	}
}

void ADeskillzManager::Initialize()
{
	if (bIsInitialized)
	{
		UE_LOG(LogDeskillz, Warning, TEXT("DeskillzManager already initialized"));
		return;
	}
	
	if (!SDK)
	{
		UE_LOG(LogDeskillz, Error, TEXT("Cannot initialize - SDK not available"));
		return;
	}
	
	UE_LOG(LogDeskillz, Log, TEXT("DeskillzManager initializing SDK..."));
	
	// SDK initialization happens automatically through GameInstance subsystem
	// But we can trigger it manually if needed
	if (!SDK->IsReady())
	{
		SDK->InitializeSDK();
	}
	else
	{
		// Already initialized
		bIsInitialized = true;
		OnSDKInitialized.Broadcast(true, FDeskillzError::None());
	}
}

void ADeskillzManager::BindSDKEvents()
{
	if (!SDK)
	{
		return;
	}
	
	// Bind to SDK events and forward to our Blueprint-assignable events
	SDK->OnInitialized.AddDynamic(this, &ADeskillzManager::HandleSDKInitialized);
	SDK->OnMatchStarted.AddDynamic(this, &ADeskillzManager::HandleMatchStarted);
	SDK->OnMatchCompleted.AddDynamic(this, &ADeskillzManager::HandleMatchCompleted);
	SDK->OnError.AddDynamic(this, &ADeskillzManager::HandleError);
}

void ADeskillzManager::HandleSDKInitialized(bool bSuccess, const FDeskillzError& Error)
{
	bIsInitialized = bSuccess;
	
	UE_LOG(LogDeskillz, Log, TEXT("SDK Initialization %s"), bSuccess ? TEXT("succeeded") : TEXT("failed"));
	
	// Forward to Blueprint
	OnSDKInitialized.Broadcast(bSuccess, Error);
	
	if (!bSuccess)
	{
		OnError.Broadcast(Error);
	}
}

void ADeskillzManager::HandleMatchStarted(const FDeskillzMatchInfo& MatchInfo, const FDeskillzError& Error)
{
	UE_LOG(LogDeskillz, Log, TEXT("Match started: %s vs %s"), 
		*MatchInfo.LocalPlayer.Username, *MatchInfo.Opponent.Username);
	
	// Forward to Blueprint
	OnMatchReady.Broadcast(MatchInfo, Error);
	
	// After a brief delay, signal gameplay start
	// This gives time for UI transitions
	FTimerHandle TimerHandle;
	FTimerDelegate TimerDelegate;
	TimerDelegate.BindLambda([this, MatchInfo]()
	{
		OnGameplayStart.Broadcast(MatchInfo);
	});
	
	GetWorldTimerManager().SetTimer(TimerHandle, TimerDelegate, 0.5f, false);
}

void ADeskillzManager::HandleMatchCompleted(const FDeskillzMatchResult& Result, const FDeskillzError& Error)
{
	UE_LOG(LogDeskillz, Log, TEXT("Match completed: %s (Score: %lld)"), 
		Result.IsWin() ? TEXT("WIN") : (Result.IsLoss() ? TEXT("LOSS") : TEXT("DRAW")),
		Result.PlayerScore);
	
	// Forward to Blueprint
	OnMatchCompleted.Broadcast(Result, Error);
}

void ADeskillzManager::HandleError(const FDeskillzError& Error)
{
	UE_LOG(LogDeskillz, Error, TEXT("SDK Error: %s"), *Error.Message);
	
	// Forward to Blueprint
	OnError.Broadcast(Error);
}

FDeskillzMatchInfo ADeskillzManager::GetMatchInfo() const
{
	if (SDK)
	{
		return SDK->GetCurrentMatch();
	}
	return FDeskillzMatchInfo();
}

bool ADeskillzManager::IsReady() const
{
	return SDK && SDK->IsReady();
}

bool ADeskillzManager::IsInMatch() const
{
	return SDK && SDK->IsInMatch();
}
