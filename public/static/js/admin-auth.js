// ========================================
// 管理画面認証機能
// ========================================

// セッション管理
const SESSION_KEY = 'school_admin_session';
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8時間

// ログイン試行回数制限
const LOGIN_ATTEMPTS_KEY = 'school_login_attempts';
const MAX_LOGIN_ATTEMPTS = 5; // 最大試行回数
const LOCKOUT_DURATION = 15 * 60 * 1000; // ロックアウト時間: 15分

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
    
    // ログイン試行回数をチェック
    if (isAccountLocked()) {
        const lockoutData = getLoginAttempts();
        const remainingTime = Math.ceil((lockoutData.lockedUntil - Date.now()) / 1000 / 60);
        errorMessage.textContent = `アカウントがロックされています。${remainingTime}分後に再試行してください。`;
        errorMessage.classList.add('show');
        return;
    }
    
    // デモ用の簡易認証
    if (username === 'admin' && password === 'admin123') {
        // ログイン成功 - 試行回数をリセット
        clearLoginAttempts();
        
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
        // ログイン失敗 - 試行回数を記録
        recordFailedAttempt();
        const attemptsData = getLoginAttempts();
        const remainingAttempts = MAX_LOGIN_ATTEMPTS - attemptsData.count;
        
        if (remainingAttempts > 0) {
            errorMessage.textContent = `ユーザー名またはパスワードが正しくありません。（残り${remainingAttempts}回）`;
        } else {
            errorMessage.textContent = `ログイン試行回数が上限に達しました。15分後に再試行してください。`;
        }
        
        errorMessage.classList.add('show');
        
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    }
}

/**
 * ログイン試行回数を取得
 */
function getLoginAttempts() {
    const data = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    if (!data) {
        return { count: 0, lockedUntil: null };
    }
    
    try {
        return JSON.parse(data);
    } catch (error) {
        return { count: 0, lockedUntil: null };
    }
}

/**
 * ログイン失敗を記録
 */
function recordFailedAttempt() {
    const attemptsData = getLoginAttempts();
    attemptsData.count += 1;
    
    // 最大試行回数に達したらロックアウト
    if (attemptsData.count >= MAX_LOGIN_ATTEMPTS) {
        attemptsData.lockedUntil = Date.now() + LOCKOUT_DURATION;
    }
    
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attemptsData));
}

/**
 * アカウントがロックされているかチェック
 */
function isAccountLocked() {
    const attemptsData = getLoginAttempts();
    
    // ロックアウト時刻が設定されていない場合
    if (!attemptsData.lockedUntil) {
        return false;
    }
    
    // ロックアウト期間が過ぎている場合はリセット
    if (Date.now() > attemptsData.lockedUntil) {
        clearLoginAttempts();
        return false;
    }
    
    return true;
}

/**
 * ログイン試行回数をクリア
 */
function clearLoginAttempts() {
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
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
        if (currentTime > session.expiresAt) {
            localStorage.removeItem(SESSION_KEY);
            alert('セッションの有効期限が切れました。再度ログインしてください。');
            redirectToLogin();
            return;
        }
        
        // ユーザー名を表示
        const usernameElement = document.getElementById('adminUsername');
        if (usernameElement) {
            usernameElement.textContent = session.username;
        }
        
        // セッション自動延長（アクティビティがある場合）
        updateSessionExpiry();
        
        // 定期的にセッションをチェック（1分ごと）
        setInterval(() => {
            checkSessionExpiry();
        }, 60000);
        
    } catch (error) {
        console.error('Session error:', error);
        redirectToLogin();
    }
}

/**
 * セッション有効期限を更新
 */
function updateSessionExpiry() {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return;
    
    try {
        const session = JSON.parse(sessionData);
        const currentTime = new Date().getTime();
        
        // セッションを延長（最後のアクティビティから8時間）
        session.expiresAt = currentTime + SESSION_DURATION;
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
        console.error('Update session error:', error);
    }
}

/**
 * セッション有効期限をチェック
 */
function checkSessionExpiry() {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) {
        redirectToLogin();
        return;
    }
    
    try {
        const session = JSON.parse(sessionData);
        const currentTime = new Date().getTime();
        
        if (currentTime > session.expiresAt) {
            localStorage.removeItem(SESSION_KEY);
            alert('セッションの有効期限が切れました。再度ログインしてください。');
            redirectToLogin();
        }
    } catch (error) {
        console.error('Check session error:', error);
        redirectToLogin();
    }
}

// ユーザーアクティビティを検知してセッションを延長
document.addEventListener('click', updateSessionExpiry);
document.addEventListener('keydown', updateSessionExpiry);

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