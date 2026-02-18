// ========================================
// 管理画面認証機能
// ========================================

// セッション管理
const SESSION_KEY = 'school_admin_session';
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8時間

// ログイン処理
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // ログインページの場合
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 管理画面の場合は認証チェック
    if (document.body.classList.contains('admin-page')) {
        checkAuth();
        
        // 両方のIDに対応
        const logoutButton = logoutBtn || document.getElementById('logout-btn');
        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        }
    }
});

// ログイン処理
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('loginError');
    
    // デモ用の簡易認証
    if (username === 'admin' && password === 'admin123') {
        // セッション情報を保存
        const currentTime = new Date().getTime();
        const session = {
            username: username,
            loginTime: currentTime,
            expiresAt: currentTime + SESSION_DURATION
        };
        
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        
        // ダッシュボードにリダイレクト
        window.location.href = 'admin-dashboard.html';
    } else {
        errorMessage.textContent = 'ユーザー名またはパスワードが正しくありません。';
        errorMessage.classList.add('show');
        
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    }
}

// 認証チェック
function checkAuth() {
    const sessionData = localStorage.getItem(SESSION_KEY);
    
    if (!sessionData) {
        redirectToLogin();
        return;
    }
    
    try {
        const session = JSON.parse(sessionData);
        const currentTime = new Date().getTime();
        
        // セッション期限チェック
        if (currentTime - session.loginTime > SESSION_DURATION) {
            localStorage.removeItem(SESSION_KEY);
            redirectToLogin();
            return;
        }
        
        // ユーザー名を表示
        const usernameElement = document.getElementById('adminUsername');
        if (usernameElement) {
            usernameElement.textContent = session.username;
        }
    } catch (error) {
        console.error('Session error:', error);
        redirectToLogin();
    }
}

// ログインページにリダイレクト
function redirectToLogin() {
    window.location.href = 'admin-login.html';
}

// ログアウト処理
function handleLogout() {
    if (confirm('ログアウトしますか?')) {
        localStorage.removeItem(SESSION_KEY);
        redirectToLogin();
    }
}