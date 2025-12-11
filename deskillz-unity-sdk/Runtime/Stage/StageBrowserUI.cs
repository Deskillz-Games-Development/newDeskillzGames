// =============================================================================
// Deskillz SDK for Unity - Phase 6: Custom Stage System
// Copyright (c) 2024 Deskillz.Games. All rights reserved.
// =============================================================================

using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using Deskillz.UI;

namespace Deskillz.Stage
{
    /// <summary>
    /// UI for browsing and joining public stages.
    /// </summary>
    public class StageBrowserUI : UIPanel
    {
        // =============================================================================
        // UI REFERENCES
        // =============================================================================

        private RectTransform _panel;
        private Text _titleText;
        private InputField _searchInput;
        private Button _refreshButton;
        private Button _createButton;
        private Button _joinCodeButton;
        private RectTransform _listContainer;
        private Text _emptyText;
        private Button _closeButton;

        private readonly List<StageListItem> _listItems = new List<StageListItem>();

        // =============================================================================
        // EVENTS
        // =============================================================================

        public event Action OnCreateStage;
        public event Action OnJoinByCode;
        public event Action<StageInfo> OnStageSelected;

        // =============================================================================
        // INITIALIZATION
        // =============================================================================

        protected override void SetupLayout()
        {
            var rect = GetComponent<RectTransform>();
            SetAnchorFill(rect);

            // Background overlay
            var overlay = gameObject.AddComponent<Image>();
            overlay.color = _theme?.OverlayColor ?? new Color(0, 0, 0, 0.8f);

            // Main panel
            var panelGO = new GameObject("Panel");
            panelGO.transform.SetParent(transform, false);

            _panel = panelGO.AddComponent<RectTransform>();
            _panel.anchorMin = new Vector2(0.1f, 0.1f);
            _panel.anchorMax = new Vector2(0.9f, 0.9f);
            _panel.offsetMin = Vector2.zero;
            _panel.offsetMax = Vector2.zero;

            var panelImage = panelGO.AddComponent<Image>();
            panelImage.color = _theme?.PanelColor ?? new Color(0.15f, 0.15f, 0.2f);

            CreateHeader();
            CreateToolbar();
            CreateStageList();
            CreateFooter();
        }

        private void CreateHeader()
        {
            // Title
            _titleText = CreateText("Title", _panel, "BROWSE STAGES");
            _titleText.rectTransform.anchorMin = new Vector2(0, 1);
            _titleText.rectTransform.anchorMax = new Vector2(1, 1);
            _titleText.rectTransform.pivot = new Vector2(0.5f, 1);
            _titleText.rectTransform.anchoredPosition = new Vector2(0, -15);
            _titleText.rectTransform.sizeDelta = new Vector2(0, 50);
            _titleText.alignment = TextAnchor.MiddleCenter;
            _titleText.fontSize = _theme?.HeadingFontSize ?? 32;
            _titleText.fontStyle = FontStyle.Bold;

            // Close button
            var closeGO = new GameObject("CloseButton");
            closeGO.transform.SetParent(_panel, false);

            var closeRect = closeGO.AddComponent<RectTransform>();
            closeRect.anchorMin = new Vector2(1, 1);
            closeRect.anchorMax = new Vector2(1, 1);
            closeRect.pivot = new Vector2(1, 1);
            closeRect.anchoredPosition = new Vector2(-10, -10);
            closeRect.sizeDelta = new Vector2(40, 40);

            var closeImage = closeGO.AddComponent<Image>();
            closeImage.color = new Color(1, 1, 1, 0.3f);

            _closeButton = closeGO.AddComponent<Button>();
            _closeButton.targetGraphic = closeImage;
            _closeButton.onClick.AddListener(Hide);

            var closeText = CreateText("X", closeRect, "✕");
            closeText.rectTransform.anchorMin = Vector2.zero;
            closeText.rectTransform.anchorMax = Vector2.one;
            closeText.rectTransform.offsetMin = Vector2.zero;
            closeText.rectTransform.offsetMax = Vector2.zero;
            closeText.alignment = TextAnchor.MiddleCenter;
        }

        private void CreateToolbar()
        {
            var toolbarGO = new GameObject("Toolbar");
            toolbarGO.transform.SetParent(_panel, false);

            var toolbarRect = toolbarGO.AddComponent<RectTransform>();
            toolbarRect.anchorMin = new Vector2(0, 1);
            toolbarRect.anchorMax = new Vector2(1, 1);
            toolbarRect.pivot = new Vector2(0.5f, 1);
            toolbarRect.anchoredPosition = new Vector2(0, -70);
            toolbarRect.sizeDelta = new Vector2(-40, 50);

            var layout = toolbarGO.AddComponent<HorizontalLayoutGroup>();
            layout.spacing = 10;
            layout.childForceExpandHeight = true;
            layout.childForceExpandWidth = false;
            layout.childControlHeight = true;
            layout.padding = new RectOffset(0, 0, 5, 5);

            // Search input
            var searchGO = new GameObject("Search");
            searchGO.transform.SetParent(toolbarRect, false);

            var searchRect = searchGO.AddComponent<RectTransform>();
            searchRect.sizeDelta = new Vector2(250, 40);

            var searchBg = searchGO.AddComponent<Image>();
            searchBg.color = new Color(0.1f, 0.1f, 0.15f);

            _searchInput = searchGO.AddComponent<InputField>();
            _searchInput.textComponent = CreateText("Text", searchRect, "");
            _searchInput.textComponent.rectTransform.anchorMin = Vector2.zero;
            _searchInput.textComponent.rectTransform.anchorMax = Vector2.one;
            _searchInput.textComponent.rectTransform.offsetMin = new Vector2(10, 0);
            _searchInput.textComponent.rectTransform.offsetMax = new Vector2(-10, 0);
            _searchInput.textComponent.alignment = TextAnchor.MiddleLeft;

            var placeholder = CreateText("Placeholder", searchRect, "Search stages...");
            placeholder.rectTransform.anchorMin = Vector2.zero;
            placeholder.rectTransform.anchorMax = Vector2.one;
            placeholder.rectTransform.offsetMin = new Vector2(10, 0);
            placeholder.rectTransform.offsetMax = new Vector2(-10, 0);
            placeholder.alignment = TextAnchor.MiddleLeft;
            placeholder.color = new Color(0.5f, 0.5f, 0.5f);
            _searchInput.placeholder = placeholder;

            // Refresh button
            _refreshButton = CreateButton("Refresh", toolbarRect, "↻ Refresh", () =>
            {
                StageManager.Instance?.RefreshStageList();
            });
            _refreshButton.GetComponent<RectTransform>().sizeDelta = new Vector2(120, 40);

            // Spacer
            var spacer = new GameObject("Spacer");
            spacer.transform.SetParent(toolbarRect, false);
            var spacerLayout = spacer.AddComponent<LayoutElement>();
            spacerLayout.flexibleWidth = 1;

            // Join by code button
            _joinCodeButton = CreateButton("JoinCode", toolbarRect, "Enter Code", () =>
            {
                OnJoinByCode?.Invoke();
            });
            _joinCodeButton.GetComponent<RectTransform>().sizeDelta = new Vector2(130, 40);
            _joinCodeButton.GetComponent<Image>().color = _theme?.SecondaryButton.NormalColor ?? Color.gray;

            // Create button
            _createButton = CreateButton("Create", toolbarRect, "+ Create Stage", () =>
            {
                OnCreateStage?.Invoke();
            });
            _createButton.GetComponent<RectTransform>().sizeDelta = new Vector2(150, 40);
        }

        private void CreateStageList()
        {
            var listGO = new GameObject("StageList");
            listGO.transform.SetParent(_panel, false);

            _listContainer = listGO.AddComponent<RectTransform>();
            _listContainer.anchorMin = new Vector2(0, 0);
            _listContainer.anchorMax = new Vector2(1, 1);
            _listContainer.offsetMin = new Vector2(20, 80);
            _listContainer.offsetMax = new Vector2(-20, -130);

            var layout = listGO.AddComponent<VerticalLayoutGroup>();
            layout.spacing = 5;
            layout.childForceExpandWidth = true;
            layout.childForceExpandHeight = false;
            layout.childControlHeight = false;
            layout.padding = new RectOffset(0, 0, 5, 5);

            // Scroll view would go here for production
            var bg = listGO.AddComponent<Image>();
            bg.color = new Color(0.1f, 0.1f, 0.12f);

            // Empty text
            _emptyText = CreateText("EmptyText", _listContainer, "No stages found.\nCreate one or check back later!");
            _emptyText.rectTransform.anchorMin = Vector2.zero;
            _emptyText.rectTransform.anchorMax = Vector2.one;
            _emptyText.rectTransform.offsetMin = Vector2.zero;
            _emptyText.rectTransform.offsetMax = Vector2.zero;
            _emptyText.alignment = TextAnchor.MiddleCenter;
            _emptyText.color = _theme?.TextSecondary ?? Color.gray;
        }

        private void CreateFooter()
        {
            var footerGO = new GameObject("Footer");
            footerGO.transform.SetParent(_panel, false);

            var footerRect = footerGO.AddComponent<RectTransform>();
            footerRect.anchorMin = new Vector2(0, 0);
            footerRect.anchorMax = new Vector2(1, 0);
            footerRect.pivot = new Vector2(0.5f, 0);
            footerRect.anchoredPosition = new Vector2(0, 10);
            footerRect.sizeDelta = new Vector2(-40, 50);

            var footerText = CreateText("FooterText", footerRect, "Select a stage to join or create your own");
            footerText.rectTransform.anchorMin = Vector2.zero;
            footerText.rectTransform.anchorMax = Vector2.one;
            footerText.alignment = TextAnchor.MiddleCenter;
            footerText.fontSize = 16;
            footerText.color = _theme?.TextSecondary ?? Color.gray;
        }

        // =============================================================================
        // PUBLIC METHODS
        // =============================================================================

        /// <summary>
        /// Update the stage list display.
        /// </summary>
        public void UpdateList(List<StageInfo> stages)
        {
            // Clear existing items
            foreach (var item in _listItems)
            {
                Destroy(item.gameObject);
            }
            _listItems.Clear();

            // Show empty message or list
            _emptyText.gameObject.SetActive(stages == null || stages.Count == 0);

            if (stages == null) return;

            foreach (var stage in stages)
            {
                var item = CreateListItem(stage);
                _listItems.Add(item);
            }
        }

        private StageListItem CreateListItem(StageInfo stage)
        {
            var itemGO = new GameObject($"Stage_{stage.StageId}");
            itemGO.transform.SetParent(_listContainer, false);

            var item = itemGO.AddComponent<StageListItem>();
            item.Initialize(_theme, stage, () => OnStageSelected?.Invoke(stage));

            return item;
        }

        // =============================================================================
        // THEME
        // =============================================================================

        public override void ApplyTheme(DeskillzTheme theme)
        {
            _theme = theme;

            if (_titleText != null) _titleText.color = theme.TextPrimary;
            if (_emptyText != null) _emptyText.color = theme.TextSecondary;

            foreach (var item in _listItems)
            {
                item.ApplyTheme(theme);
            }
        }
    }

    // =============================================================================
    // STAGE LIST ITEM
    // =============================================================================

    /// <summary>
    /// Single item in the stage browser list.
    /// </summary>
    public class StageListItem : MonoBehaviour
    {
        private Image _background;
        private Text _nameText;
        private Text _hostText;
        private Text _gameText;
        private Text _playersText;
        private Text _entryText;
        private Button _joinButton;
        private DeskillzTheme _theme;

        public void Initialize(DeskillzTheme theme, StageInfo stage, Action onJoin)
        {
            _theme = theme;

            var rect = gameObject.AddComponent<RectTransform>();
            rect.sizeDelta = new Vector2(0, 70);

            _background = gameObject.AddComponent<Image>();
            _background.color = new Color(0.15f, 0.15f, 0.18f);

            // Name
            _nameText = CreateText("Name", stage.Name, new Vector2(15, 0), TextAnchor.MiddleLeft);
            _nameText.rectTransform.anchorMin = new Vector2(0, 0.5f);
            _nameText.rectTransform.anchorMax = new Vector2(0.3f, 1);
            _nameText.fontStyle = FontStyle.Bold;
            _nameText.fontSize = 20;

            // Host
            _hostText = CreateText("Host", $"by {stage.HostName}", new Vector2(15, 0), TextAnchor.MiddleLeft);
            _hostText.rectTransform.anchorMin = new Vector2(0, 0);
            _hostText.rectTransform.anchorMax = new Vector2(0.3f, 0.5f);
            _hostText.fontSize = 14;
            _hostText.color = theme?.TextSecondary ?? Color.gray;

            // Game
            _gameText = CreateText("Game", stage.GameName, Vector2.zero, TextAnchor.MiddleCenter);
            _gameText.rectTransform.anchorMin = new Vector2(0.3f, 0);
            _gameText.rectTransform.anchorMax = new Vector2(0.5f, 1);

            // Players
            _playersText = CreateText("Players", stage.GetPlayerCountText(), Vector2.zero, TextAnchor.MiddleCenter);
            _playersText.rectTransform.anchorMin = new Vector2(0.5f, 0);
            _playersText.rectTransform.anchorMax = new Vector2(0.65f, 1);
            _playersText.color = stage.PlayerCount >= stage.MaxPlayers ? 
                (theme?.ErrorColor ?? Color.red) : (theme?.TextPrimary ?? Color.white);

            // Entry fee
            _entryText = CreateText("Entry", stage.GetEntryFeeText(), Vector2.zero, TextAnchor.MiddleCenter);
            _entryText.rectTransform.anchorMin = new Vector2(0.65f, 0);
            _entryText.rectTransform.anchorMax = new Vector2(0.8f, 1);
            _entryText.color = stage.EntryFee > 0 ? 
                (theme?.SuccessColor ?? Color.green) : (theme?.TextSecondary ?? Color.gray);

            // Join button
            var joinGO = new GameObject("JoinButton");
            joinGO.transform.SetParent(transform, false);

            var joinRect = joinGO.AddComponent<RectTransform>();
            joinRect.anchorMin = new Vector2(0.82f, 0.2f);
            joinRect.anchorMax = new Vector2(0.98f, 0.8f);
            joinRect.offsetMin = Vector2.zero;
            joinRect.offsetMax = Vector2.zero;

            var joinImage = joinGO.AddComponent<Image>();
            joinImage.color = stage.IsJoinable ? 
                (theme?.PrimaryColor ?? Color.blue) : (theme?.TextDisabled ?? Color.gray);

            _joinButton = joinGO.AddComponent<Button>();
            _joinButton.targetGraphic = joinImage;
            _joinButton.interactable = stage.IsJoinable;
            _joinButton.onClick.AddListener(() => onJoin?.Invoke());

            var joinText = CreateText("JoinText", stage.IsJoinable ? "JOIN" : "FULL", Vector2.zero, TextAnchor.MiddleCenter);
            joinText.transform.SetParent(joinRect, false);
            joinText.rectTransform.anchorMin = Vector2.zero;
            joinText.rectTransform.anchorMax = Vector2.one;
            joinText.fontStyle = FontStyle.Bold;
        }

        private Text CreateText(string name, string content, Vector2 offset, TextAnchor alignment)
        {
            var go = new GameObject(name);
            go.transform.SetParent(transform, false);

            var rect = go.AddComponent<RectTransform>();
            rect.offsetMin = offset;
            rect.offsetMax = Vector2.zero;

            var text = go.AddComponent<Text>();
            text.text = content;
            text.alignment = alignment;
            text.fontSize = 18;
            text.color = _theme?.TextPrimary ?? Color.white;
            text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");

            return text;
        }

        public void ApplyTheme(DeskillzTheme theme)
        {
            _theme = theme;
            if (_nameText != null) _nameText.color = theme.TextPrimary;
            if (_hostText != null) _hostText.color = theme.TextSecondary;
        }
    }

    // =============================================================================
    // WAITING ROOM UI
    // =============================================================================

    /// <summary>
    /// UI for stage waiting room.
    /// </summary>
    public class WaitingRoomUI : UIPanel
    {
        // UI References
        private Text _stageNameText;
        private Text _inviteCodeText;
        private Text _playerCountText;
        private Text _entryFeeText;
        private Text _statusText;
        private RectTransform _playerListContainer;
        private Button _readyButton;
        private Button _startButton;
        private Button _leaveButton;
        private Button _copyCodeButton;
        private Button _settingsButton;

        private readonly List<PlayerListItem> _playerItems = new List<PlayerListItem>();
        private StageRoom _currentStage;

        // Events
        public event Action OnReady;
        public event Action OnStart;
        public event Action OnLeave;
        public event Action OnSettings;

        protected override void SetupLayout()
        {
            var rect = GetComponent<RectTransform>();
            SetAnchorFill(rect);

            var bg = gameObject.AddComponent<Image>();
            bg.color = _theme?.BackgroundColor ?? new Color(0.1f, 0.1f, 0.12f);

            CreateHeader();
            CreateInviteSection();
            CreatePlayerList();
            CreateFooter();
        }

        private void CreateHeader()
        {
            _stageNameText = CreateText("StageName", transform, "Stage Name");
            _stageNameText.rectTransform.anchorMin = new Vector2(0, 1);
            _stageNameText.rectTransform.anchorMax = new Vector2(1, 1);
            _stageNameText.rectTransform.pivot = new Vector2(0.5f, 1);
            _stageNameText.rectTransform.anchoredPosition = new Vector2(0, -20);
            _stageNameText.rectTransform.sizeDelta = new Vector2(0, 50);
            _stageNameText.alignment = TextAnchor.MiddleCenter;
            _stageNameText.fontSize = _theme?.HeadingFontSize ?? 32;
            _stageNameText.fontStyle = FontStyle.Bold;

            _statusText = CreateText("Status", transform, "Waiting for players...");
            _statusText.rectTransform.anchorMin = new Vector2(0, 1);
            _statusText.rectTransform.anchorMax = new Vector2(1, 1);
            _statusText.rectTransform.pivot = new Vector2(0.5f, 1);
            _statusText.rectTransform.anchoredPosition = new Vector2(0, -70);
            _statusText.rectTransform.sizeDelta = new Vector2(0, 30);
            _statusText.alignment = TextAnchor.MiddleCenter;
            _statusText.fontSize = 18;
            _statusText.color = _theme?.TextSecondary ?? Color.gray;
        }

        private void CreateInviteSection()
        {
            var inviteGO = new GameObject("InviteSection");
            inviteGO.transform.SetParent(transform, false);

            var inviteRect = inviteGO.AddComponent<RectTransform>();
            inviteRect.anchorMin = new Vector2(0.3f, 1);
            inviteRect.anchorMax = new Vector2(0.7f, 1);
            inviteRect.pivot = new Vector2(0.5f, 1);
            inviteRect.anchoredPosition = new Vector2(0, -110);
            inviteRect.sizeDelta = new Vector2(0, 60);

            var inviteBg = inviteGO.AddComponent<Image>();
            inviteBg.color = new Color(0.2f, 0.2f, 0.25f);

            _inviteCodeText = CreateText("InviteCode", inviteRect, "CODE: XXXXXX");
            _inviteCodeText.rectTransform.anchorMin = new Vector2(0, 0);
            _inviteCodeText.rectTransform.anchorMax = new Vector2(0.7f, 1);
            _inviteCodeText.rectTransform.offsetMin = new Vector2(15, 0);
            _inviteCodeText.rectTransform.offsetMax = Vector2.zero;
            _inviteCodeText.alignment = TextAnchor.MiddleLeft;
            _inviteCodeText.fontSize = 24;
            _inviteCodeText.fontStyle = FontStyle.Bold;

            _copyCodeButton = CreateButton("CopyCode", inviteRect, "COPY", () =>
            {
                StageManager.Instance?.CopyInviteCode();
            });
            var copyRect = _copyCodeButton.GetComponent<RectTransform>();
            copyRect.anchorMin = new Vector2(0.72f, 0.15f);
            copyRect.anchorMax = new Vector2(0.98f, 0.85f);
            copyRect.offsetMin = Vector2.zero;
            copyRect.offsetMax = Vector2.zero;
        }

        private void CreatePlayerList()
        {
            var listGO = new GameObject("PlayerList");
            listGO.transform.SetParent(transform, false);

            _playerListContainer = listGO.AddComponent<RectTransform>();
            _playerListContainer.anchorMin = new Vector2(0.1f, 0.2f);
            _playerListContainer.anchorMax = new Vector2(0.9f, 0.75f);
            _playerListContainer.offsetMin = Vector2.zero;
            _playerListContainer.offsetMax = Vector2.zero;

            var layout = listGO.AddComponent<VerticalLayoutGroup>();
            layout.spacing = 5;
            layout.childForceExpandWidth = true;
            layout.childForceExpandHeight = false;

            var bg = listGO.AddComponent<Image>();
            bg.color = new Color(0.12f, 0.12f, 0.15f);

            _playerCountText = CreateText("PlayerCount", _playerListContainer, "Players: 0/8");
            _playerCountText.rectTransform.sizeDelta = new Vector2(0, 40);
            _playerCountText.alignment = TextAnchor.MiddleCenter;
        }

        private void CreateFooter()
        {
            var footerGO = new GameObject("Footer");
            footerGO.transform.SetParent(transform, false);

            var footerRect = footerGO.AddComponent<RectTransform>();
            footerRect.anchorMin = new Vector2(0, 0);
            footerRect.anchorMax = new Vector2(1, 0);
            footerRect.pivot = new Vector2(0.5f, 0);
            footerRect.anchoredPosition = new Vector2(0, 20);
            footerRect.sizeDelta = new Vector2(-40, 60);

            var layout = footerGO.AddComponent<HorizontalLayoutGroup>();
            layout.spacing = 15;
            layout.childAlignment = TextAnchor.MiddleCenter;
            layout.childForceExpandWidth = false;
            layout.childForceExpandHeight = false;

            // Leave button
            _leaveButton = CreateButton("Leave", footerRect, "LEAVE", () => OnLeave?.Invoke());
            _leaveButton.GetComponent<RectTransform>().sizeDelta = new Vector2(120, 50);
            _leaveButton.GetComponent<Image>().color = _theme?.DangerButton.NormalColor ?? Color.red;

            // Settings button (host only)
            _settingsButton = CreateButton("Settings", footerRect, "⚙ SETTINGS", () => OnSettings?.Invoke());
            _settingsButton.GetComponent<RectTransform>().sizeDelta = new Vector2(140, 50);
            _settingsButton.GetComponent<Image>().color = _theme?.SecondaryButton.NormalColor ?? Color.gray;

            // Ready button
            _readyButton = CreateButton("Ready", footerRect, "READY", () => OnReady?.Invoke());
            _readyButton.GetComponent<RectTransform>().sizeDelta = new Vector2(140, 50);

            // Start button (host only)
            _startButton = CreateButton("Start", footerRect, "START MATCH", () => OnStart?.Invoke());
            _startButton.GetComponent<RectTransform>().sizeDelta = new Vector2(160, 50);
            _startButton.GetComponent<Image>().color = _theme?.SuccessColor ?? Color.green;
        }

        // =============================================================================
        // PUBLIC METHODS
        // =============================================================================

        /// <summary>
        /// Set stage data to display.
        /// </summary>
        public void SetStage(StageRoom stage)
        {
            _currentStage = stage;
            UpdateDisplay();
        }

        /// <summary>
        /// Refresh the display.
        /// </summary>
        public void UpdateDisplay()
        {
            if (_currentStage == null) return;

            _stageNameText.text = _currentStage.Config.Name;
            _inviteCodeText.text = $"CODE: {_currentStage.InviteCode}";
            _playerCountText.text = $"Players: {_currentStage.GetPlayerCountText()}";
            _statusText.text = _currentStage.GetStatusText();

            // Host controls
            bool isHost = _currentStage.IsLocalPlayerHost;
            _startButton.gameObject.SetActive(isHost);
            _settingsButton.gameObject.SetActive(isHost);
            _startButton.interactable = _currentStage.HasMinimumPlayers;

            // Ready button
            var localPlayer = _currentStage.GetLocalPlayer();
            if (localPlayer != null)
            {
                _readyButton.GetComponentInChildren<Text>().text = localPlayer.IsReady ? "NOT READY" : "READY";
                _readyButton.GetComponent<Image>().color = localPlayer.IsReady ?
                    (_theme?.WarningColor ?? Color.yellow) : (_theme?.PrimaryColor ?? Color.blue);
            }

            UpdatePlayerList();
        }

        private void UpdatePlayerList()
        {
            // Clear existing
            foreach (var item in _playerItems)
            {
                Destroy(item.gameObject);
            }
            _playerItems.Clear();

            // Create new items
            foreach (var player in _currentStage.Players)
            {
                var item = CreatePlayerItem(player);
                _playerItems.Add(item);
            }
        }

        private PlayerListItem CreatePlayerItem(StagePlayer player)
        {
            var itemGO = new GameObject($"Player_{player.PlayerId}");
            itemGO.transform.SetParent(_playerListContainer, false);

            var item = itemGO.AddComponent<PlayerListItem>();
            item.Initialize(_theme, player, _currentStage.IsLocalPlayerHost);

            return item;
        }

        public override void ApplyTheme(DeskillzTheme theme)
        {
            _theme = theme;
            if (_stageNameText != null) _stageNameText.color = theme.TextPrimary;
            if (_statusText != null) _statusText.color = theme.TextSecondary;
        }
    }

    // =============================================================================
    // PLAYER LIST ITEM
    // =============================================================================

    public class PlayerListItem : MonoBehaviour
    {
        private Text _nameText;
        private Text _statusText;
        private Button _kickButton;

        public void Initialize(DeskillzTheme theme, StagePlayer player, bool showKick)
        {
            var rect = gameObject.AddComponent<RectTransform>();
            rect.sizeDelta = new Vector2(0, 50);

            var bg = gameObject.AddComponent<Image>();
            bg.color = player.IsHost ? new Color(0.3f, 0.25f, 0.1f) : new Color(0.15f, 0.15f, 0.18f);

            _nameText = CreateText("Name", player.Username + (player.IsHost ? " (Host)" : ""));
            _nameText.rectTransform.anchorMin = new Vector2(0, 0);
            _nameText.rectTransform.anchorMax = new Vector2(0.6f, 1);
            _nameText.rectTransform.offsetMin = new Vector2(15, 0);
            _nameText.alignment = TextAnchor.MiddleLeft;
            _nameText.fontStyle = player.IsHost ? FontStyle.Bold : FontStyle.Normal;

            _statusText = CreateText("Status", player.GetStatusText());
            _statusText.rectTransform.anchorMin = new Vector2(0.6f, 0);
            _statusText.rectTransform.anchorMax = new Vector2(0.85f, 1);
            _statusText.alignment = TextAnchor.MiddleCenter;
            _statusText.color = player.IsReady ? (theme?.SuccessColor ?? Color.green) : (theme?.TextSecondary ?? Color.gray);

            if (showKick && !player.IsHost)
            {
                var kickGO = new GameObject("Kick");
                kickGO.transform.SetParent(transform, false);

                var kickRect = kickGO.AddComponent<RectTransform>();
                kickRect.anchorMin = new Vector2(0.87f, 0.15f);
                kickRect.anchorMax = new Vector2(0.98f, 0.85f);
                kickRect.offsetMin = Vector2.zero;
                kickRect.offsetMax = Vector2.zero;

                var kickImage = kickGO.AddComponent<Image>();
                kickImage.color = theme?.ErrorColor ?? Color.red;

                _kickButton = kickGO.AddComponent<Button>();
                _kickButton.targetGraphic = kickImage;
                _kickButton.onClick.AddListener(() =>
                {
                    StageManager.Instance?.KickPlayer(player.PlayerId);
                });

                var kickText = CreateText("KickText", "✕");
                kickText.transform.SetParent(kickRect, false);
                kickText.rectTransform.anchorMin = Vector2.zero;
                kickText.rectTransform.anchorMax = Vector2.one;
                kickText.alignment = TextAnchor.MiddleCenter;
            }
        }

        private Text CreateText(string name, string content)
        {
            var go = new GameObject(name);
            go.transform.SetParent(transform, false);

            var rect = go.AddComponent<RectTransform>();
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;

            var text = go.AddComponent<Text>();
            text.text = content;
            text.fontSize = 18;
            text.color = Color.white;
            text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");

            return text;
        }
    }
}
