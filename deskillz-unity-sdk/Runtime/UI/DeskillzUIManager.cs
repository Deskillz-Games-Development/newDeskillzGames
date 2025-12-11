// =============================================================================
// Deskillz SDK for Unity - Phase 4: Pre-Built UI System
// Copyright (c) 2024 Deskillz.Games. All rights reserved.
// =============================================================================

using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using Deskillz.Match;
using Deskillz.Score;

namespace Deskillz.UI
{
    /// <summary>
    /// Manages all Deskillz UI components.
    /// Provides easy access to HUD, leaderboard, results, and other UI elements.
    /// </summary>
    public class DeskillzUIManager : MonoBehaviour
    {
        // =============================================================================
        // SINGLETON
        // =============================================================================

        private static DeskillzUIManager _instance;

        public static DeskillzUIManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<DeskillzUIManager>();
                    if (_instance == null)
                    {
                        CreateUIManager();
                    }
                }
                return _instance;
            }
        }

        public static bool HasInstance => _instance != null;

        // =============================================================================
        // CONFIGURATION
        // =============================================================================

        [Header("UI Settings")]
        [Tooltip("Use built-in Deskillz UI")]
        [SerializeField] private bool _useBuiltInUI = true;

        [Tooltip("Auto-show HUD when match starts")]
        [SerializeField] private bool _autoShowHUD = true;

        [Tooltip("Auto-show results when match ends")]
        [SerializeField] private bool _autoShowResults = true;

        [Tooltip("Canvas sort order for Deskillz UI")]
        [SerializeField] private int _sortOrder = 100;

        [Header("Theme")]
        [SerializeField] private DeskillzTheme _theme;

        [Header("UI References")]
        [SerializeField] private MatchHUD _matchHUD;
        [SerializeField] private LeaderboardUI _leaderboard;
        [SerializeField] private ResultsUI _results;
        [SerializeField] private CountdownUI _countdown;
        [SerializeField] private NotificationUI _notifications;
        [SerializeField] private PauseMenuUI _pauseMenu;

        // =============================================================================
        // STATE
        // =============================================================================

        private Canvas _canvas;
        private CanvasScaler _canvasScaler;
        private GraphicRaycaster _raycaster;
        private IDeskillzUI _customUI;
        private readonly Stack<UIPanel> _panelStack = new Stack<UIPanel>();
        private bool _isInitialized;

        // =============================================================================
        // PROPERTIES
        // =============================================================================

        /// <summary>Whether using built-in UI.</summary>
        public bool UseBuiltInUI => _useBuiltInUI && _customUI == null;

        /// <summary>Current theme.</summary>
        public DeskillzTheme Theme => _theme;

        /// <summary>Match HUD component.</summary>
        public MatchHUD HUD => _matchHUD;

        /// <summary>Leaderboard component.</summary>
        public LeaderboardUI Leaderboard => _leaderboard;

        /// <summary>Results component.</summary>
        public ResultsUI Results => _results;

        /// <summary>Notifications component.</summary>
        public NotificationUI Notifications => _notifications;

        /// <summary>Main UI canvas.</summary>
        public Canvas Canvas => _canvas;

        /// <summary>Custom UI implementation (if any).</summary>
        public IDeskillzUI CustomUI => _customUI;

        /// <summary>Whether any panel is currently open.</summary>
        public bool HasOpenPanel => _panelStack.Count > 0;

        // =============================================================================
        // UNITY LIFECYCLE
        // =============================================================================

        private void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }

            _instance = this;
            DontDestroyOnLoad(gameObject);

            Initialize();
        }

        private void OnEnable()
        {
            SubscribeToEvents();
        }

        private void OnDisable()
        {
            UnsubscribeFromEvents();
        }

        // =============================================================================
        // INITIALIZATION
        // =============================================================================

        private static void CreateUIManager()
        {
            var go = new GameObject("DeskillzUIManager");
            _instance = go.AddComponent<DeskillzUIManager>();
            DontDestroyOnLoad(go);
        }

        private void Initialize()
        {
            if (_isInitialized) return;

            // Create or get canvas
            SetupCanvas();

            // Load default theme if none assigned
            if (_theme == null)
            {
                _theme = DeskillzTheme.CreateDefault();
            }

            // Create UI components if using built-in UI
            if (_useBuiltInUI)
            {
                CreateUIComponents();
            }

            _isInitialized = true;
            DeskillzLogger.Debug("DeskillzUIManager initialized");
        }

        private void SetupCanvas()
        {
            _canvas = GetComponentInChildren<Canvas>();
            
            if (_canvas == null)
            {
                var canvasGO = new GameObject("DeskillzCanvas");
                canvasGO.transform.SetParent(transform);

                _canvas = canvasGO.AddComponent<Canvas>();
                _canvas.renderMode = RenderMode.ScreenSpaceOverlay;
                _canvas.sortingOrder = _sortOrder;

                _canvasScaler = canvasGO.AddComponent<CanvasScaler>();
                _canvasScaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
                _canvasScaler.referenceResolution = new Vector2(1920, 1080);
                _canvasScaler.matchWidthOrHeight = 0.5f;

                _raycaster = canvasGO.AddComponent<GraphicRaycaster>();
            }
            else
            {
                _canvasScaler = _canvas.GetComponent<CanvasScaler>();
                _raycaster = _canvas.GetComponent<GraphicRaycaster>();
            }
        }

        private void CreateUIComponents()
        {
            // Create HUD
            if (_matchHUD == null)
            {
                var hudGO = new GameObject("MatchHUD");
                hudGO.transform.SetParent(_canvas.transform, false);
                _matchHUD = hudGO.AddComponent<MatchHUD>();
                _matchHUD.Initialize(_theme);
                _matchHUD.Hide();
            }

            // Create Leaderboard
            if (_leaderboard == null)
            {
                var lbGO = new GameObject("Leaderboard");
                lbGO.transform.SetParent(_canvas.transform, false);
                _leaderboard = lbGO.AddComponent<LeaderboardUI>();
                _leaderboard.Initialize(_theme);
                _leaderboard.Hide();
            }

            // Create Results
            if (_results == null)
            {
                var resultsGO = new GameObject("Results");
                resultsGO.transform.SetParent(_canvas.transform, false);
                _results = resultsGO.AddComponent<ResultsUI>();
                _results.Initialize(_theme);
                _results.Hide();
            }

            // Create Countdown
            if (_countdown == null)
            {
                var countdownGO = new GameObject("Countdown");
                countdownGO.transform.SetParent(_canvas.transform, false);
                _countdown = countdownGO.AddComponent<CountdownUI>();
                _countdown.Initialize(_theme);
                _countdown.Hide();
            }

            // Create Notifications
            if (_notifications == null)
            {
                var notifGO = new GameObject("Notifications");
                notifGO.transform.SetParent(_canvas.transform, false);
                _notifications = notifGO.AddComponent<NotificationUI>();
                _notifications.Initialize(_theme);
            }

            // Create Pause Menu
            if (_pauseMenu == null)
            {
                var pauseGO = new GameObject("PauseMenu");
                pauseGO.transform.SetParent(_canvas.transform, false);
                _pauseMenu = pauseGO.AddComponent<PauseMenuUI>();
                _pauseMenu.Initialize(_theme);
                _pauseMenu.Hide();
            }

            DeskillzLogger.Debug("UI components created");
        }

        private void SubscribeToEvents()
        {
            DeskillzEvents.OnMatchReady += HandleMatchReady;
            DeskillzEvents.OnMatchStart += HandleMatchStart;
            DeskillzEvents.OnMatchComplete += HandleMatchComplete;
            DeskillzEvents.OnMatchCountdown += HandleCountdown;
            DeskillzEvents.OnMatchPaused += HandleMatchPaused;
            DeskillzEvents.OnMatchResumed += HandleMatchResumed;
            DeskillzEvents.OnLocalScoreUpdated += HandleScoreUpdated;
            DeskillzEvents.OnOpponentScoreUpdated += HandleOpponentScoreUpdated;
            DeskillzEvents.OnError += HandleError;
        }

        private void UnsubscribeFromEvents()
        {
            DeskillzEvents.OnMatchReady -= HandleMatchReady;
            DeskillzEvents.OnMatchStart -= HandleMatchStart;
            DeskillzEvents.OnMatchComplete -= HandleMatchComplete;
            DeskillzEvents.OnMatchCountdown -= HandleCountdown;
            DeskillzEvents.OnMatchPaused -= HandleMatchPaused;
            DeskillzEvents.OnMatchResumed -= HandleMatchResumed;
            DeskillzEvents.OnLocalScoreUpdated -= HandleScoreUpdated;
            DeskillzEvents.OnOpponentScoreUpdated -= HandleOpponentScoreUpdated;
            DeskillzEvents.OnError -= HandleError;
        }

        // =============================================================================
        // CUSTOM UI
        // =============================================================================

        /// <summary>
        /// Set a custom UI implementation.
        /// </summary>
        public void SetCustomUI(IDeskillzUI customUI)
        {
            _customUI = customUI;

            // Hide built-in UI
            if (customUI != null)
            {
                HideAllBuiltIn();
            }

            DeskillzLogger.Debug($"Custom UI set: {customUI?.GetType().Name ?? "null"}");
        }

        /// <summary>
        /// Clear custom UI and revert to built-in.
        /// </summary>
        public void ClearCustomUI()
        {
            _customUI = null;
            DeskillzLogger.Debug("Reverted to built-in UI");
        }

        // =============================================================================
        // THEME
        // =============================================================================

        /// <summary>
        /// Apply a new theme to all UI components.
        /// </summary>
        public void ApplyTheme(DeskillzTheme theme)
        {
            _theme = theme;

            _matchHUD?.ApplyTheme(theme);
            _leaderboard?.ApplyTheme(theme);
            _results?.ApplyTheme(theme);
            _countdown?.ApplyTheme(theme);
            _notifications?.ApplyTheme(theme);
            _pauseMenu?.ApplyTheme(theme);

            DeskillzLogger.Debug("Theme applied to all UI");
        }

        // =============================================================================
        // HUD CONTROL
        // =============================================================================

        /// <summary>
        /// Show the match HUD.
        /// </summary>
        public void ShowHUD()
        {
            if (_customUI != null)
            {
                _customUI.ShowHUD();
            }
            else if (_matchHUD != null)
            {
                _matchHUD.Show();
            }
        }

        /// <summary>
        /// Hide the match HUD.
        /// </summary>
        public void HideHUD()
        {
            if (_customUI != null)
            {
                _customUI.HideHUD();
            }
            else if (_matchHUD != null)
            {
                _matchHUD.Hide();
            }
        }

        /// <summary>
        /// Update HUD with current match data.
        /// </summary>
        public void UpdateHUD(int score, float timeRemaining = -1f)
        {
            if (_customUI != null)
            {
                _customUI.UpdateScore(score);
                if (timeRemaining >= 0)
                {
                    _customUI.UpdateTimer(timeRemaining);
                }
            }
            else if (_matchHUD != null)
            {
                _matchHUD.UpdateScore(score);
                if (timeRemaining >= 0)
                {
                    _matchHUD.UpdateTimer(timeRemaining);
                }
            }
        }

        // =============================================================================
        // LEADERBOARD
        // =============================================================================

        /// <summary>
        /// Show leaderboard with player list.
        /// </summary>
        public void ShowLeaderboard(List<MatchPlayer> players)
        {
            if (_customUI != null)
            {
                _customUI.ShowLeaderboard(players);
            }
            else if (_leaderboard != null)
            {
                _leaderboard.SetPlayers(players);
                _leaderboard.Show();
                PushPanel(_leaderboard);
            }
        }

        /// <summary>
        /// Hide leaderboard.
        /// </summary>
        public void HideLeaderboard()
        {
            if (_customUI != null)
            {
                _customUI.HideLeaderboard();
            }
            else if (_leaderboard != null)
            {
                _leaderboard.Hide();
                PopPanel(_leaderboard);
            }
        }

        /// <summary>
        /// Update leaderboard scores.
        /// </summary>
        public void UpdateLeaderboard(List<MatchPlayer> players)
        {
            if (_leaderboard != null && _leaderboard.IsVisible)
            {
                _leaderboard.UpdatePlayers(players);
            }
        }

        // =============================================================================
        // RESULTS
        // =============================================================================

        /// <summary>
        /// Show match results.
        /// </summary>
        public void ShowResults(MatchResult result)
        {
            if (_customUI != null)
            {
                _customUI.ShowResults(result);
            }
            else if (_results != null)
            {
                _results.SetResult(result);
                _results.Show();
                PushPanel(_results);
            }
        }

        /// <summary>
        /// Hide results screen.
        /// </summary>
        public void HideResults()
        {
            if (_customUI != null)
            {
                _customUI.HideResults();
            }
            else if (_results != null)
            {
                _results.Hide();
                PopPanel(_results);
            }
        }

        // =============================================================================
        // COUNTDOWN
        // =============================================================================

        /// <summary>
        /// Show countdown number.
        /// </summary>
        public void ShowCountdown(int seconds)
        {
            if (_customUI != null)
            {
                _customUI.ShowCountdown(seconds);
            }
            else if (_countdown != null)
            {
                _countdown.ShowNumber(seconds);
            }
        }

        /// <summary>
        /// Hide countdown.
        /// </summary>
        public void HideCountdown()
        {
            if (_countdown != null)
            {
                _countdown.Hide();
            }
        }

        // =============================================================================
        // NOTIFICATIONS
        // =============================================================================

        /// <summary>
        /// Show a notification message.
        /// </summary>
        public void ShowNotification(string message, NotificationType type = NotificationType.Info, float duration = 3f)
        {
            if (_notifications != null)
            {
                _notifications.Show(message, type, duration);
            }
        }

        /// <summary>
        /// Show success notification.
        /// </summary>
        public void ShowSuccess(string message, float duration = 3f)
        {
            ShowNotification(message, NotificationType.Success, duration);
        }

        /// <summary>
        /// Show error notification.
        /// </summary>
        public void ShowError(string message, float duration = 5f)
        {
            ShowNotification(message, NotificationType.Error, duration);
        }

        /// <summary>
        /// Show warning notification.
        /// </summary>
        public void ShowWarning(string message, float duration = 4f)
        {
            ShowNotification(message, NotificationType.Warning, duration);
        }

        // =============================================================================
        // PAUSE MENU
        // =============================================================================

        /// <summary>
        /// Show pause menu.
        /// </summary>
        public void ShowPauseMenu()
        {
            if (_pauseMenu != null)
            {
                _pauseMenu.Show();
                PushPanel(_pauseMenu);
            }
        }

        /// <summary>
        /// Hide pause menu.
        /// </summary>
        public void HidePauseMenu()
        {
            if (_pauseMenu != null)
            {
                _pauseMenu.Hide();
                PopPanel(_pauseMenu);
            }
        }

        // =============================================================================
        // PANEL MANAGEMENT
        // =============================================================================

        private void PushPanel(UIPanel panel)
        {
            if (!_panelStack.Contains(panel))
            {
                _panelStack.Push(panel);
            }
        }

        private void PopPanel(UIPanel panel)
        {
            if (_panelStack.Count > 0 && _panelStack.Peek() == panel)
            {
                _panelStack.Pop();
            }
        }

        /// <summary>
        /// Close the topmost panel.
        /// </summary>
        public void CloseTopPanel()
        {
            if (_panelStack.Count > 0)
            {
                var panel = _panelStack.Pop();
                panel.Hide();
            }
        }

        /// <summary>
        /// Close all panels.
        /// </summary>
        public void CloseAllPanels()
        {
            while (_panelStack.Count > 0)
            {
                var panel = _panelStack.Pop();
                panel.Hide();
            }
        }

        /// <summary>
        /// Hide all built-in UI.
        /// </summary>
        public void HideAllBuiltIn()
        {
            _matchHUD?.Hide();
            _leaderboard?.Hide();
            _results?.Hide();
            _countdown?.Hide();
            _pauseMenu?.Hide();
            _panelStack.Clear();
        }

        // =============================================================================
        // EVENT HANDLERS
        // =============================================================================

        private void HandleMatchReady(MatchData match)
        {
            // Prepare UI for match
            if (_matchHUD != null)
            {
                _matchHUD.SetMatchData(match);
            }
        }

        private void HandleMatchStart(MatchData match)
        {
            HideCountdown();

            if (_autoShowHUD)
            {
                ShowHUD();
            }
        }

        private void HandleMatchComplete(MatchResult result)
        {
            HideHUD();

            if (_autoShowResults)
            {
                ShowResults(result);
            }
        }

        private void HandleCountdown(int seconds)
        {
            ShowCountdown(seconds);
        }

        private void HandleMatchPaused()
        {
            ShowPauseMenu();
        }

        private void HandleMatchResumed()
        {
            HidePauseMenu();
        }

        private void HandleScoreUpdated(int score)
        {
            if (_matchHUD != null)
            {
                _matchHUD.UpdateScore(score);
            }

            _customUI?.UpdateScore(score);
        }

        private void HandleOpponentScoreUpdated(string playerId, int score)
        {
            if (_matchHUD != null)
            {
                _matchHUD.UpdateOpponentScore(playerId, score);
            }
        }

        private void HandleError(DeskillzError error)
        {
            ShowError(error.Message);
        }
    }

    // =============================================================================
    // NOTIFICATION TYPE
    // =============================================================================

    /// <summary>
    /// Types of notifications.
    /// </summary>
    public enum NotificationType
    {
        Info,
        Success,
        Warning,
        Error
    }
}
