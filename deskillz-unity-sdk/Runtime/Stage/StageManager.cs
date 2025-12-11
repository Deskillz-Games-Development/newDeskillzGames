// =============================================================================
// Deskillz SDK for Unity - Phase 6: Custom Stage System
// Copyright (c) 2024 Deskillz.Games. All rights reserved.
// =============================================================================

using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Deskillz.Multiplayer;

namespace Deskillz.Stage
{
    /// <summary>
    /// Manages custom stages (private rooms) for tournaments and matches.
    /// Allows players to create, join, and manage their own competitive spaces.
    /// </summary>
    public class StageManager : MonoBehaviour
    {
        // =============================================================================
        // SINGLETON
        // =============================================================================

        private static StageManager _instance;

        public static StageManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<StageManager>();
                    if (_instance == null && DeskillzManager.HasInstance)
                    {
                        _instance = DeskillzManager.Instance.gameObject.AddComponent<StageManager>();
                    }
                }
                return _instance;
            }
        }

        public static bool HasInstance => _instance != null;

        // =============================================================================
        // CONFIGURATION
        // =============================================================================

        [Header("Stage Settings")]
        [Tooltip("Maximum players per stage")]
        [SerializeField] private int _maxPlayersPerStage = 16;

        [Tooltip("Default stage timeout (minutes)")]
        [SerializeField] private int _defaultTimeoutMinutes = 30;

        [Tooltip("Auto-start when minimum players reached")]
        [SerializeField] private bool _autoStartEnabled = true;

        [Tooltip("Countdown before auto-start (seconds)")]
        [SerializeField] private int _autoStartCountdown = 10;

        // =============================================================================
        // STATE
        // =============================================================================

        private StageRoom _currentStage;
        private readonly Dictionary<string, StageRoom> _cachedStages = new Dictionary<string, StageRoom>();
        private readonly List<StageInfo> _publicStages = new List<StageInfo>();
        private Coroutine _refreshCoroutine;
        private bool _isRefreshing;

        // =============================================================================
        // EVENTS
        // =============================================================================

        /// <summary>Fired when a stage is created successfully.</summary>
        public event Action<StageRoom> OnStageCreated;

        /// <summary>Fired when joined a stage.</summary>
        public event Action<StageRoom> OnStageJoined;

        /// <summary>Fired when left a stage.</summary>
        public event Action<string> OnStageLeft;

        /// <summary>Fired when stage is updated.</summary>
        public event Action<StageRoom> OnStageUpdated;

        /// <summary>Fired when a player joins current stage.</summary>
        public event Action<StagePlayer> OnPlayerJoined;

        /// <summary>Fired when a player leaves current stage.</summary>
        public event Action<string> OnPlayerLeft;

        /// <summary>Fired when stage countdown starts.</summary>
        public event Action<int> OnCountdownStarted;

        /// <summary>Fired when stage match is starting.</summary>
        public event Action<StageRoom> OnStageStarting;

        /// <summary>Fired when stage is cancelled.</summary>
        public event Action<string, string> OnStageCancelled;

        /// <summary>Fired when public stage list is refreshed.</summary>
        public event Action<List<StageInfo>> OnStageListRefreshed;

        /// <summary>Fired on error.</summary>
        public event Action<string> OnError;

        // =============================================================================
        // PROPERTIES
        // =============================================================================

        /// <summary>Current stage (if any).</summary>
        public StageRoom CurrentStage => _currentStage;

        /// <summary>Whether currently in a stage.</summary>
        public bool IsInStage => _currentStage != null;

        /// <summary>Whether current player is the host.</summary>
        public bool IsHost => _currentStage?.IsLocalPlayerHost ?? false;

        /// <summary>List of public stages.</summary>
        public IReadOnlyList<StageInfo> PublicStages => _publicStages;

        /// <summary>Maximum players per stage.</summary>
        public int MaxPlayersPerStage => _maxPlayersPerStage;

        // =============================================================================
        // UNITY LIFECYCLE
        // =============================================================================

        private void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(this);
                return;
            }
            _instance = this;
        }

        private void OnDestroy()
        {
            StopRefreshing();
            LeaveStage();
        }

        // =============================================================================
        // STAGE CREATION
        // =============================================================================

        /// <summary>
        /// Create a new custom stage.
        /// </summary>
        public void CreateStage(StageConfig config, Action<StageRoom> onSuccess = null, Action<string> onError = null)
        {
            if (_currentStage != null)
            {
                var error = "Already in a stage. Leave current stage first.";
                onError?.Invoke(error);
                OnError?.Invoke(error);
                return;
            }

            StartCoroutine(CreateStageAsync(config, onSuccess, onError));
        }

        private IEnumerator CreateStageAsync(StageConfig config, Action<StageRoom> onSuccess, Action<string> onError)
        {
            DeskillzLogger.Debug($"Creating stage: {config.Name}");

            // Validate config
            var validationError = config.Validate();
            if (!string.IsNullOrEmpty(validationError))
            {
                onError?.Invoke(validationError);
                OnError?.Invoke(validationError);
                yield break;
            }

            // Generate invite code
            var inviteCode = GenerateInviteCode();

            // In test mode, create locally
            if (Deskillz.TestMode)
            {
                yield return new WaitForSeconds(0.2f);

                var stage = new StageRoom
                {
                    StageId = Guid.NewGuid().ToString("N"),
                    Config = config,
                    InviteCode = inviteCode,
                    HostId = Deskillz.CurrentPlayer?.Id ?? "local_player",
                    Status = StageStatus.Waiting,
                    CreatedAt = DateTime.UtcNow
                };

                // Add host as first player
                stage.AddPlayer(new StagePlayer
                {
                    PlayerId = stage.HostId,
                    Username = Deskillz.CurrentPlayer?.Username ?? "Host",
                    IsHost = true,
                    IsReady = true,
                    JoinedAt = DateTime.UtcNow
                });

                _currentStage = stage;
                _cachedStages[stage.StageId] = stage;

                DeskillzLogger.Debug($"Stage created: {stage.StageId}, Code: {inviteCode}");
                onSuccess?.Invoke(stage);
                OnStageCreated?.Invoke(stage);
                yield break;
            }

            // API call to create stage
            var request = new CreateStageRequest
            {
                Config = config,
                InviteCode = inviteCode
            };

            var network = DeskillzNetwork.Instance;
            bool completed = false;
            StageRoom result = null;
            string error = null;

            network.Post<CreateStageRequest, StageRoom>(
                "/api/v1/stages/create",
                request,
                response =>
                {
                    result = response;
                    completed = true;
                },
                err =>
                {
                    error = err;
                    completed = true;
                }
            );

            while (!completed)
            {
                yield return null;
            }

            if (!string.IsNullOrEmpty(error))
            {
                onError?.Invoke(error);
                OnError?.Invoke(error);
                yield break;
            }

            _currentStage = result;
            _cachedStages[result.StageId] = result;

            onSuccess?.Invoke(result);
            OnStageCreated?.Invoke(result);
        }

        /// <summary>
        /// Create a quick stage with default settings.
        /// </summary>
        public void CreateQuickStage(string gameName, Action<StageRoom> onSuccess = null, Action<string> onError = null)
        {
            var config = StageConfig.CreateDefault(gameName);
            CreateStage(config, onSuccess, onError);
        }

        // =============================================================================
        // STAGE JOINING
        // =============================================================================

        /// <summary>
        /// Join a stage by invite code.
        /// </summary>
        public void JoinByCode(string inviteCode, Action<StageRoom> onSuccess = null, Action<string> onError = null)
        {
            if (string.IsNullOrEmpty(inviteCode))
            {
                var error = "Invalid invite code";
                onError?.Invoke(error);
                OnError?.Invoke(error);
                return;
            }

            if (_currentStage != null)
            {
                var error = "Already in a stage. Leave current stage first.";
                onError?.Invoke(error);
                OnError?.Invoke(error);
                return;
            }

            StartCoroutine(JoinByCodeAsync(inviteCode.ToUpper().Trim(), onSuccess, onError));
        }

        private IEnumerator JoinByCodeAsync(string inviteCode, Action<StageRoom> onSuccess, Action<string> onError)
        {
            DeskillzLogger.Debug($"Joining stage with code: {inviteCode}");

            // Test mode
            if (Deskillz.TestMode)
            {
                yield return new WaitForSeconds(0.3f);

                // Find in cached stages
                StageRoom found = null;
                foreach (var stage in _cachedStages.Values)
                {
                    if (stage.InviteCode == inviteCode)
                    {
                        found = stage;
                        break;
                    }
                }

                if (found == null)
                {
                    onError?.Invoke("Stage not found");
                    OnError?.Invoke("Stage not found");
                    yield break;
                }

                JoinStageInternal(found, onSuccess, onError);
                yield break;
            }

            // API call
            var network = DeskillzNetwork.Instance;
            bool completed = false;
            StageRoom result = null;
            string error = null;

            network.Post<object, StageRoom>(
                $"/api/v1/stages/join/{inviteCode}",
                null,
                response =>
                {
                    result = response;
                    completed = true;
                },
                err =>
                {
                    error = err;
                    completed = true;
                }
            );

            while (!completed)
            {
                yield return null;
            }

            if (!string.IsNullOrEmpty(error))
            {
                onError?.Invoke(error);
                OnError?.Invoke(error);
                yield break;
            }

            JoinStageInternal(result, onSuccess, onError);
        }

        /// <summary>
        /// Join a stage by ID.
        /// </summary>
        public void JoinStage(string stageId, Action<StageRoom> onSuccess = null, Action<string> onError = null)
        {
            if (_currentStage != null)
            {
                var error = "Already in a stage. Leave current stage first.";
                onError?.Invoke(error);
                OnError?.Invoke(error);
                return;
            }

            StartCoroutine(JoinStageAsync(stageId, onSuccess, onError));
        }

        private IEnumerator JoinStageAsync(string stageId, Action<StageRoom> onSuccess, Action<string> onError)
        {
            DeskillzLogger.Debug($"Joining stage: {stageId}");

            if (Deskillz.TestMode)
            {
                yield return new WaitForSeconds(0.2f);

                if (_cachedStages.TryGetValue(stageId, out var stage))
                {
                    JoinStageInternal(stage, onSuccess, onError);
                }
                else
                {
                    onError?.Invoke("Stage not found");
                    OnError?.Invoke("Stage not found");
                }
                yield break;
            }

            // API call
            var network = DeskillzNetwork.Instance;
            bool completed = false;
            StageRoom result = null;
            string error = null;

            network.Post<object, StageRoom>(
                $"/api/v1/stages/{stageId}/join",
                null,
                response =>
                {
                    result = response;
                    completed = true;
                },
                err =>
                {
                    error = err;
                    completed = true;
                }
            );

            while (!completed)
            {
                yield return null;
            }

            if (!string.IsNullOrEmpty(error))
            {
                onError?.Invoke(error);
                OnError?.Invoke(error);
                yield break;
            }

            JoinStageInternal(result, onSuccess, onError);
        }

        private void JoinStageInternal(StageRoom stage, Action<StageRoom> onSuccess, Action<string> onError)
        {
            // Check if stage is joinable
            if (stage.Status != StageStatus.Waiting)
            {
                var error = "Stage is no longer accepting players";
                onError?.Invoke(error);
                OnError?.Invoke(error);
                return;
            }

            if (stage.IsFull)
            {
                var error = "Stage is full";
                onError?.Invoke(error);
                OnError?.Invoke(error);
                return;
            }

            // Add local player
            var localPlayer = new StagePlayer
            {
                PlayerId = Deskillz.CurrentPlayer?.Id ?? "local_player",
                Username = Deskillz.CurrentPlayer?.Username ?? "Player",
                IsHost = false,
                IsReady = false,
                JoinedAt = DateTime.UtcNow
            };

            stage.AddPlayer(localPlayer);
            _currentStage = stage;
            _cachedStages[stage.StageId] = stage;

            DeskillzLogger.Debug($"Joined stage: {stage.StageId}");
            onSuccess?.Invoke(stage);
            OnStageJoined?.Invoke(stage);
        }

        // =============================================================================
        // STAGE LEAVING
        // =============================================================================

        /// <summary>
        /// Leave the current stage.
        /// </summary>
        public void LeaveStage(Action onSuccess = null, Action<string> onError = null)
        {
            if (_currentStage == null)
            {
                onSuccess?.Invoke();
                return;
            }

            StartCoroutine(LeaveStageAsync(onSuccess, onError));
        }

        private IEnumerator LeaveStageAsync(Action onSuccess, Action<string> onError)
        {
            var stageId = _currentStage.StageId;
            DeskillzLogger.Debug($"Leaving stage: {stageId}");

            if (Deskillz.TestMode)
            {
                yield return new WaitForSeconds(0.1f);

                // Remove local player
                var localPlayerId = Deskillz.CurrentPlayer?.Id ?? "local_player";
                _currentStage.RemovePlayer(localPlayerId);

                // If host left, cancel or transfer
                if (_currentStage.IsLocalPlayerHost)
                {
                    _currentStage.Status = StageStatus.Cancelled;
                }

                _currentStage = null;

                onSuccess?.Invoke();
                OnStageLeft?.Invoke(stageId);
                yield break;
            }

            // API call
            var network = DeskillzNetwork.Instance;
            bool completed = false;
            string error = null;

            network.Post<object, object>(
                $"/api/v1/stages/{stageId}/leave",
                null,
                _ => completed = true,
                err =>
                {
                    error = err;
                    completed = true;
                }
            );

            while (!completed)
            {
                yield return null;
            }

            _currentStage = null;

            if (!string.IsNullOrEmpty(error))
            {
                onError?.Invoke(error);
            }
            else
            {
                onSuccess?.Invoke();
            }

            OnStageLeft?.Invoke(stageId);
        }

        // =============================================================================
        // HOST CONTROLS
        // =============================================================================

        /// <summary>
        /// Start the stage match (host only).
        /// </summary>
        public void StartStage(Action onSuccess = null, Action<string> onError = null)
        {
            if (!IsHost)
            {
                var error = "Only the host can start the stage";
                onError?.Invoke(error);
                OnError?.Invoke(error);
                return;
            }

            if (_currentStage.PlayerCount < _currentStage.Config.MinPlayers)
            {
                var error = $"Need at least {_currentStage.Config.MinPlayers} players to start";
                onError?.Invoke(error);
                OnError?.Invoke(error);
                return;
            }

            StartCoroutine(StartStageAsync(onSuccess, onError));
        }

        private IEnumerator StartStageAsync(Action onSuccess, Action<string> onError)
        {
            DeskillzLogger.Debug($"Starting stage: {_currentStage.StageId}");

            _currentStage.Status = StageStatus.Starting;
            OnStageStarting?.Invoke(_currentStage);

            if (Deskillz.TestMode)
            {
                // Countdown
                for (int i = _autoStartCountdown; i > 0; i--)
                {
                    OnCountdownStarted?.Invoke(i);
                    yield return new WaitForSeconds(1f);
                }

                _currentStage.Status = StageStatus.InProgress;
                onSuccess?.Invoke();

                // Trigger match start through Deskillz
                DeskillzEvents.RaiseMatchReady(new MatchData
                {
                    MatchId = _currentStage.StageId,
                    GameId = _currentStage.Config.GameId,
                    IsRealtime = _currentStage.Config.GameMode == StageGameMode.Synchronous,
                    EntryFee = _currentStage.Config.EntryFee,
                    Currency = _currentStage.Config.Currency
                });
                yield break;
            }

            // API call
            var network = DeskillzNetwork.Instance;
            bool completed = false;
            string error = null;

            network.Post<object, object>(
                $"/api/v1/stages/{_currentStage.StageId}/start",
                null,
                _ => completed = true,
                err =>
                {
                    error = err;
                    completed = true;
                }
            );

            while (!completed)
            {
                yield return null;
            }

            if (!string.IsNullOrEmpty(error))
            {
                _currentStage.Status = StageStatus.Waiting;
                onError?.Invoke(error);
                OnError?.Invoke(error);
            }
            else
            {
                onSuccess?.Invoke();
            }
        }

        /// <summary>
        /// Kick a player from the stage (host only).
        /// </summary>
        public void KickPlayer(string playerId, string reason = null, Action onSuccess = null, Action<string> onError = null)
        {
            if (!IsHost)
            {
                var error = "Only the host can kick players";
                onError?.Invoke(error);
                OnError?.Invoke(error);
                return;
            }

            if (playerId == _currentStage.HostId)
            {
                var error = "Cannot kick yourself";
                onError?.Invoke(error);
                OnError?.Invoke(error);
                return;
            }

            StartCoroutine(KickPlayerAsync(playerId, reason, onSuccess, onError));
        }

        private IEnumerator KickPlayerAsync(string playerId, string reason, Action onSuccess, Action<string> onError)
        {
            DeskillzLogger.Debug($"Kicking player: {playerId}");

            if (Deskillz.TestMode)
            {
                yield return new WaitForSeconds(0.1f);
                _currentStage.RemovePlayer(playerId);
                onSuccess?.Invoke();
                OnPlayerLeft?.Invoke(playerId);
                OnStageUpdated?.Invoke(_currentStage);
                yield break;
            }

            var network = DeskillzNetwork.Instance;
            bool completed = false;
            string error = null;

            network.Post<object, object>(
                $"/api/v1/stages/{_currentStage.StageId}/kick/{playerId}",
                new { reason },
                _ => completed = true,
                err =>
                {
                    error = err;
                    completed = true;
                }
            );

            while (!completed)
            {
                yield return null;
            }

            if (!string.IsNullOrEmpty(error))
            {
                onError?.Invoke(error);
            }
            else
            {
                _currentStage.RemovePlayer(playerId);
                onSuccess?.Invoke();
                OnPlayerLeft?.Invoke(playerId);
                OnStageUpdated?.Invoke(_currentStage);
            }
        }

        /// <summary>
        /// Cancel the stage (host only).
        /// </summary>
        public void CancelStage(string reason = null, Action onSuccess = null, Action<string> onError = null)
        {
            if (!IsHost)
            {
                var error = "Only the host can cancel the stage";
                onError?.Invoke(error);
                OnError?.Invoke(error);
                return;
            }

            StartCoroutine(CancelStageAsync(reason, onSuccess, onError));
        }

        private IEnumerator CancelStageAsync(string reason, Action onSuccess, Action<string> onError)
        {
            var stageId = _currentStage.StageId;
            DeskillzLogger.Debug($"Cancelling stage: {stageId}");

            if (Deskillz.TestMode)
            {
                yield return new WaitForSeconds(0.1f);
                _currentStage.Status = StageStatus.Cancelled;
                _currentStage = null;
                onSuccess?.Invoke();
                OnStageCancelled?.Invoke(stageId, reason);
                yield break;
            }

            var network = DeskillzNetwork.Instance;
            bool completed = false;
            string error = null;

            network.Post<object, object>(
                $"/api/v1/stages/{stageId}/cancel",
                new { reason },
                _ => completed = true,
                err =>
                {
                    error = err;
                    completed = true;
                }
            );

            while (!completed)
            {
                yield return null;
            }

            if (!string.IsNullOrEmpty(error))
            {
                onError?.Invoke(error);
            }
            else
            {
                _currentStage = null;
                onSuccess?.Invoke();
                OnStageCancelled?.Invoke(stageId, reason);
            }
        }

        /// <summary>
        /// Update stage configuration (host only).
        /// </summary>
        public void UpdateConfig(StageConfig newConfig, Action onSuccess = null, Action<string> onError = null)
        {
            if (!IsHost)
            {
                var error = "Only the host can update configuration";
                onError?.Invoke(error);
                OnError?.Invoke(error);
                return;
            }

            var validationError = newConfig.Validate();
            if (!string.IsNullOrEmpty(validationError))
            {
                onError?.Invoke(validationError);
                OnError?.Invoke(validationError);
                return;
            }

            _currentStage.Config = newConfig;
            OnStageUpdated?.Invoke(_currentStage);
            onSuccess?.Invoke();
        }

        // =============================================================================
        // PLAYER ACTIONS
        // =============================================================================

        /// <summary>
        /// Set ready status.
        /// </summary>
        public void SetReady(bool ready, Action onSuccess = null, Action<string> onError = null)
        {
            if (_currentStage == null)
            {
                onError?.Invoke("Not in a stage");
                return;
            }

            var localPlayerId = Deskillz.CurrentPlayer?.Id ?? "local_player";
            var player = _currentStage.GetPlayer(localPlayerId);

            if (player != null)
            {
                player.IsReady = ready;
                OnStageUpdated?.Invoke(_currentStage);
                onSuccess?.Invoke();

                // Check for auto-start
                if (_autoStartEnabled && _currentStage.AreAllPlayersReady && 
                    _currentStage.PlayerCount >= _currentStage.Config.MinPlayers)
                {
                    if (IsHost)
                    {
                        StartStage();
                    }
                }
            }
        }

        // =============================================================================
        // STAGE BROWSING
        // =============================================================================

        /// <summary>
        /// Refresh the list of public stages.
        /// </summary>
        public void RefreshStageList(Action<List<StageInfo>> onSuccess = null, Action<string> onError = null)
        {
            if (_isRefreshing) return;
            StartCoroutine(RefreshStageListAsync(onSuccess, onError));
        }

        private IEnumerator RefreshStageListAsync(Action<List<StageInfo>> onSuccess, Action<string> onError)
        {
            _isRefreshing = true;

            if (Deskillz.TestMode)
            {
                yield return new WaitForSeconds(0.2f);

                // Generate some test stages
                _publicStages.Clear();
                for (int i = 0; i < 5; i++)
                {
                    _publicStages.Add(new StageInfo
                    {
                        StageId = $"test_stage_{i}",
                        Name = $"Test Stage {i + 1}",
                        HostName = $"Player{i}",
                        GameName = "Test Game",
                        PlayerCount = UnityEngine.Random.Range(1, 8),
                        MaxPlayers = 8,
                        EntryFee = i * 5,
                        Currency = "USDT",
                        Status = StageStatus.Waiting
                    });
                }

                _isRefreshing = false;
                onSuccess?.Invoke(_publicStages);
                OnStageListRefreshed?.Invoke(_publicStages);
                yield break;
            }

            var network = DeskillzNetwork.Instance;
            bool completed = false;
            List<StageInfo> result = null;
            string error = null;

            network.Get<StageListResponse>(
                "/api/v1/stages/public",
                response =>
                {
                    result = response.Stages;
                    completed = true;
                },
                err =>
                {
                    error = err;
                    completed = true;
                }
            );

            while (!completed)
            {
                yield return null;
            }

            _isRefreshing = false;

            if (!string.IsNullOrEmpty(error))
            {
                onError?.Invoke(error);
                OnError?.Invoke(error);
            }
            else
            {
                _publicStages.Clear();
                _publicStages.AddRange(result);
                onSuccess?.Invoke(_publicStages);
                OnStageListRefreshed?.Invoke(_publicStages);
            }
        }

        /// <summary>
        /// Start auto-refreshing stage list.
        /// </summary>
        public void StartAutoRefresh(float intervalSeconds = 10f)
        {
            StopRefreshing();
            _refreshCoroutine = StartCoroutine(AutoRefreshCoroutine(intervalSeconds));
        }

        /// <summary>
        /// Stop auto-refreshing.
        /// </summary>
        public void StopRefreshing()
        {
            if (_refreshCoroutine != null)
            {
                StopCoroutine(_refreshCoroutine);
                _refreshCoroutine = null;
            }
        }

        private IEnumerator AutoRefreshCoroutine(float interval)
        {
            while (true)
            {
                RefreshStageList();
                yield return new WaitForSeconds(interval);
            }
        }

        // =============================================================================
        // INVITE SYSTEM
        // =============================================================================

        /// <summary>
        /// Generate a shareable invite link.
        /// </summary>
        public string GetInviteLink()
        {
            if (_currentStage == null) return null;
            return $"https://deskillz.games/join/{_currentStage.InviteCode}";
        }

        /// <summary>
        /// Copy invite code to clipboard.
        /// </summary>
        public void CopyInviteCode()
        {
            if (_currentStage == null) return;
            GUIUtility.systemCopyBuffer = _currentStage.InviteCode;
            DeskillzLogger.Debug($"Copied invite code: {_currentStage.InviteCode}");
        }

        private string GenerateInviteCode()
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            var code = new char[6];
            var random = new System.Random();

            for (int i = 0; i < code.Length; i++)
            {
                code[i] = chars[random.Next(chars.Length)];
            }

            return new string(code);
        }

        // =============================================================================
        // INTERNAL HANDLERS
        // =============================================================================

        internal void HandlePlayerJoined(StagePlayer player)
        {
            if (_currentStage != null)
            {
                _currentStage.AddPlayer(player);
                OnPlayerJoined?.Invoke(player);
                OnStageUpdated?.Invoke(_currentStage);
            }
        }

        internal void HandlePlayerLeft(string playerId)
        {
            if (_currentStage != null)
            {
                _currentStage.RemovePlayer(playerId);
                OnPlayerLeft?.Invoke(playerId);
                OnStageUpdated?.Invoke(_currentStage);
            }
        }

        internal void HandleStageUpdate(StageRoom update)
        {
            if (_currentStage != null && _currentStage.StageId == update.StageId)
            {
                _currentStage = update;
                OnStageUpdated?.Invoke(_currentStage);
            }
        }
    }

    // =============================================================================
    // API MODELS
    // =============================================================================

    [Serializable]
    internal class CreateStageRequest
    {
        public StageConfig Config;
        public string InviteCode;
    }

    [Serializable]
    internal class StageListResponse
    {
        public List<StageInfo> Stages;
    }
}
