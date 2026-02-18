/**
 * イベント管理（統合版）
 * 新しいコアライブラリを使用
 * Version: 2.0.0
 * Created: 2026-02-18
 */

// コアライブラリをインポート
import { toast, loading, escapeHtml, formatDate, storage } from './core/admin-core.js';
import { api } from './core/api-client.js';

// ==============================================
// 1. 状態管理
// ==============================================

const state = {
  currentEditId: null,
  events: []
};

// ==============================================
// 2. イベント一覧の読み込み
// ==============================================

async function loadEvents() {
  const tbody = document.getElementById('eventsTableBody');
  
  try {
    const response = await api.events.list({
      sort: '-event_date',
      showLoading: true
    });
    
    state.events = response.data || [];
    
    if (state.events.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #9ca3af;">まだイベントがありません</td></tr>';
      return;
    }
    
    tbody.innerHTML = state.events.map(event => `
      <tr data-id="${event.id}">
        <td>${escapeHtml(event.title)}</td>
        <td>${formatDate(event.event_date)}</td>
        <td>${escapeHtml(event.location || '-')}</td>
        <td><span class="status-badge ${event.status === '公開' ? 'published' : 'draft'}">${escapeHtml(event.status)}</span></td>
        <td class="table-actions-improved">
          <button class="action-btn action-btn-edit" onclick="window.editEvent('${event.id}')">
            <i class="fas fa-edit"></i> 編集
          </button>
          <button class="action-btn action-btn-delete" onclick="window.deleteEvent('${event.id}')">
            <i class="fas fa-trash"></i> 削除
          </button>
        </td>
      </tr>
    `).join('');
    
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #ef4444;">読み込みに失敗しました</td></tr>';
  }
}

// ==============================================
// 3. フォーム処理
// ==============================================

function setupForm() {
  const form = document.getElementById('eventForm');
  if (!form) return;
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
      title: document.getElementById('eventTitle').value,
      event_date: document.getElementById('eventDate').value,
      location: document.getElementById('eventLocation').value,
      description: document.getElementById('eventDescription').value,
      status: document.getElementById('eventStatus').value
    };
    
    try {
      if (state.currentEditId) {
        await api.events.update(state.currentEditId, formData);
      } else {
        await api.events.create(formData);
      }
      
      hideEventForm();
      await loadEvents();
      storage.remove('event_autosave');
      
    } catch (error) {
      // エラーはapi-client.jsで処理済み
    }
  });
}

// ==============================================
// 4. CRUD操作
// ==============================================

async function editEvent(id) {
  try {
    state.currentEditId = id;
    const event = await api.events.get(id);
    
    document.getElementById('eventTitle').value = event.title || '';
    document.getElementById('eventDate').value = event.event_date ? event.event_date.split('T')[0] : '';
    document.getElementById('eventLocation').value = event.location || '';
    document.getElementById('eventDescription').value = event.description || '';
    document.getElementById('eventStatus').value = event.status || '下書き';
    
    document.getElementById('eventFormPanel').classList.add('open');
    
  } catch (error) {
    // エラー処理済み
  }
}

async function deleteEvent(id) {
  const result = await api.events.delete(id);
  if (result) {
    await loadEvents();
  }
}

function showEventForm() {
  state.currentEditId = null;
  document.getElementById('eventForm').reset();
  document.getElementById('eventStatus').value = '下書き';
  document.getElementById('eventDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('eventFormPanel').classList.add('open');
}

function hideEventForm() {
  document.getElementById('eventFormPanel').classList.remove('open');
  state.currentEditId = null;
}

// ==============================================
// 5. 初期化
// ==============================================

document.addEventListener('DOMContentLoaded', function() {
  loadEvents();
  setupForm();
});

// ==============================================
// 6. グローバル公開
// ==============================================

window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
window.showEventForm = showEventForm;
window.hideEventForm = hideEventForm;

console.log('✅ Event Management (v2.0 - Integrated) loaded');
