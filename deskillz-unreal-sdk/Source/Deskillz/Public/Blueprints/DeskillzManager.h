// Copyright Deskillz Games. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Core/DeskillzTypes.h"
#include "DeskillzManager.generated.h"

class UDeskillzSDK;

/**
 * Deskillz Manager Actor
 * 
 * AUTOMATIC SETUP - You don't need to place this actor manually!
 * The SDK auto-spawns this manager when needed.
 * 
 * However, you CAN place this actor in your level if you want to:
 * - See the manager in the World Outliner
 * - Override default settings per-level
 * - Add custom event bindings in the level Blueprint
 * 
 * This actor persists across level loads and handles:
 * - SDK initialization
 * - Match lifecycle management
 * - Event forwarding to Blueprints
 * - UI widget spawning
 */
UCLASS(Blueprintable, BlueprintType, meta = (DisplayName = "Deskillz Manager"))
class DESKILLZ_API ADeskillzManager : public AActor
{
	GENERATED_BODY()
	
public:
	ADeskillzManager();
	
	// ========================================================================
	// Singleton Access
	// ========================================================================
	
	/**
	 * Get the Deskillz Manager instance
	 * Creates one if it doesn't exist
	 */
	UFUNCTION(BlueprintPure, Category = "Deskillz", meta = (WorldContext = "WorldContextObject", DisplayName = "Get Deskillz Manager"))
	static ADeskillzManager* Get(const UObject* WorldContextObject);
	
	/**
	 * Check if manager exists
	 */
	UFUNCTION(BlueprintPure, Category = "Deskillz")
	static bool IsManagerAvailable();
	
protected:
	virtual void BeginPlay() override;
	virtual void EndPlay(const EEndPlayReason::Type EndPlayReason) override;
	virtual void Tick(float DeltaTime) override;
	
public:
	// ========================================================================
	// Configuration (Can override in placed actor)
	// ========================================================================
	
	/**
	 * Auto-initialize SDK on BeginPlay
	 * Disable if you want manual control
	 */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Deskillz|Setup")
	bool bAutoInitialize = true;
	
	/**
	 * Show built-in UI automatically
	 * Disable if using custom UI
	 */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Deskillz|Setup")
	bool bUseBuiltInUI = true;
	
	/**
	 * Persist across level loads (DontDestroyOnLoad)
	 */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Deskillz|Setup")
	bool bPersistAcrossLevels = true;
	
	/**
	 * Show debug info on screen
	 */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Deskillz|Debug")
	bool bShowDebugInfo = false;
	
	// ========================================================================
	// Blueprint Events - Bind to these in your Level Blueprint!
	// ========================================================================
	
	/**
	 * Called when SDK initialization completes
	 * @param bSuccess True if initialization succeeded
	 */
	UPROPERTY(BlueprintAssignable, Category = "Deskillz|Events")
	FOnDeskillzInitialized OnSDKInitialized;
	
	/**
	 * Called when a tournament match is found and ready
	 */
	UPROPERTY(BlueprintAssignable, Category = "Deskillz|Events")
	FOnDeskillzMatchStarted OnMatchReady;
	
	/**
	 * Called when match gameplay should begin
	 * Start your game timer here!
	 */
	DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnGameplayStart, const FDeskillzMatchInfo&, MatchInfo);
	UPROPERTY(BlueprintAssignable, Category = "Deskillz|Events")
	FOnGameplayStart OnGameplayStart;
	
	/**
	 * Called when match ends (score submitted, results available)
	 */
	UPROPERTY(BlueprintAssignable, Category = "Deskillz|Events")
	FOnDeskillzMatchCompleted OnMatchCompleted;
	
	/**
	 * Called when an error occurs
	 */
	UPROPERTY(BlueprintAssignable, Category = "Deskillz|Events")
	FOnDeskillzError OnError;
	
	/**
	 * Called every second during match with time update
	 */
	DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnMatchTimeUpdate, float, RemainingSeconds, float, ElapsedSeconds);
	UPROPERTY(BlueprintAssignable, Category = "Deskillz|Events")
	FOnMatchTimeUpdate OnMatchTimeUpdate;
	
	// ========================================================================
	// Public Methods
	// ========================================================================
	
	/**
	 * Manually initialize SDK (if bAutoInitialize is false)
	 */
	UFUNCTION(BlueprintCallable, Category = "Deskillz")
	void Initialize();
	
	/**
	 * Get SDK reference
	 */
	UFUNCTION(BlueprintPure, Category = "Deskillz")
	UDeskillzSDK* GetSDK() const { return SDK; }
	
	/**
	 * Get current match info
	 */
	UFUNCTION(BlueprintPure, Category = "Deskillz")
	FDeskillzMatchInfo GetMatchInfo() const;
	
	/**
	 * Is SDK ready?
	 */
	UFUNCTION(BlueprintPure, Category = "Deskillz")
	bool IsReady() const;
	
	/**
	 * Is in active match?
	 */
	UFUNCTION(BlueprintPure, Category = "Deskillz")
	bool IsInMatch() const;
	
protected:
	// ========================================================================
	// Internal
	// ========================================================================
	
	/** Cached SDK reference */
	UPROPERTY()
	UDeskillzSDK* SDK;
	
	/** Singleton instance */
	static ADeskillzManager* Instance;
	
	/** Has been initialized */
	bool bIsInitialized = false;
	
	/** Timer for match time updates */
	float MatchTimeUpdateTimer = 0.0f;
	
	/** Bind to SDK events */
	void BindSDKEvents();
	
	/** SDK event handlers */
	UFUNCTION()
	void HandleSDKInitialized(bool bSuccess, const FDeskillzError& Error);
	
	UFUNCTION()
	void HandleMatchStarted(const FDeskillzMatchInfo& MatchInfo, const FDeskillzError& Error);
	
	UFUNCTION()
	void HandleMatchCompleted(const FDeskillzMatchResult& Result, const FDeskillzError& Error);
	
	UFUNCTION()
	void HandleError(const FDeskillzError& Error);
};
