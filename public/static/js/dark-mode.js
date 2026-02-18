/**
 * ダークモード機能
 * ユーザーの設定を記憶し、全ページで適用する
 */

(function() {
    'use strict';

    // 現在のテーマを取得
    function getCurrentTheme() {
        return localStorage.getItem('theme') || 'light';
    }

    // テーマを設定
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    // テーマを切り替え
    function toggleTheme() {
        const currentTheme = getCurrentTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        updateToggleButton();
    }

    // トグルボタンの表示を更新
    function updateToggleButton() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        const currentTheme = getCurrentTheme();
        const icon = themeToggle.querySelector('i');
        
        if (icon) {
            if (currentTheme === 'dark') {
                icon.className = 'fas fa-sun';
                themeToggle.title = 'ライトモードに切り替え';
            } else {
                icon.className = 'fas fa-moon';
                themeToggle.title = 'ダークモードに切り替え';
            }
        }
    }

    // 初期化
    function init() {
        // 保存されたテーマを適用
        const savedTheme = getCurrentTheme();
        setTheme(savedTheme);

        // ページ読み込み完了後にボタンを設定
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupToggleButton);
        } else {
            setupToggleButton();
        }
    }

    // トグルボタンのイベントリスナーを設定
    function setupToggleButton() {
        const themeToggle = document.getElementById('theme-toggle');
        
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
            updateToggleButton();
        }
    }

    // 初期化を実行
    init();

    // グローバルに公開（必要に応じて）
    window.DarkMode = {
        toggle: toggleTheme,
        setTheme: setTheme,
        getCurrentTheme: getCurrentTheme
    };

    console.log('✅ Dark Mode initialized');
})();
