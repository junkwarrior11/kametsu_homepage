/**
 * Phase 3: 高度な管理機能
 * - ドラッグ&ドロップ並び替え
 * - 一括操作（複数選択・削除・公開）
 * - CSVエクスポート
 * - 自動保存
 */

// ========================================
// ドラッグ&ドロップ並び替え
// ========================================
class DragDropManager {
    constructor(tableSelector, options = {}) {
        this.table = document.querySelector(tableSelector);
        this.tbody = this.table?.querySelector('tbody');
        this.options = {
            handle: '.drag-handle',
            onReorder: null,
            ...options
        };
        
        if (this.tbody) {
            this.init();
        }
    }

    init() {
        let draggedRow = null;
        let draggedIndex = null;

        this.tbody.querySelectorAll('tr').forEach((row, index) => {
            row.setAttribute('draggable', 'true');
            row.dataset.index = index;

            // ドラッグハンドルを追加
            if (!row.querySelector('.drag-handle')) {
                const handleCell = document.createElement('td');
                handleCell.className = 'drag-handle-cell';
                handleCell.innerHTML = '<span class="drag-handle" title="ドラッグして並び替え"><i class="fas fa-grip-vertical"></i></span>';
                row.insertBefore(handleCell, row.firstChild);
            }

            row.addEventListener('dragstart', (e) => {
                draggedRow = row;
                draggedIndex = index;
                row.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            row.addEventListener('dragend', (e) => {
                row.classList.remove('dragging');
            });

            row.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';

                const afterElement = this.getDragAfterElement(e.clientY);
                if (afterElement == null) {
                    this.tbody.appendChild(draggedRow);
                } else {
                    this.tbody.insertBefore(draggedRow, afterElement);
                }
            });

            row.addEventListener('drop', (e) => {
                e.preventDefault();
                if (this.options.onReorder) {
                    const newOrder = Array.from(this.tbody.querySelectorAll('tr')).map(r => r.dataset.id);
                    this.options.onReorder(newOrder);
                }
            });
        });

        // ヘッダーにドラッグハンドル用の列を追加
        const thead = this.table.querySelector('thead tr');
        if (thead && !thead.querySelector('.drag-handle-cell')) {
            const handleHeader = document.createElement('th');
            handleHeader.className = 'drag-handle-cell';
            handleHeader.innerHTML = '<i class="fas fa-arrows-alt"></i>';
            handleHeader.style.width = '50px';
            thead.insertBefore(handleHeader, thead.firstChild);
        }
    }

    getDragAfterElement(y) {
        const draggableElements = [...this.tbody.querySelectorAll('tr:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    updateOrder(newOrder) {
        console.log('New order:', newOrder);
        toast.success('並び替え完了', '変更を保存しました');
    }
}

window.DragDropManager = DragDropManager;

// ========================================
// 一括操作マネージャー
// ========================================
class BulkActionManager {
    constructor(tableSelector, options = {}) {
        this.table = document.querySelector(tableSelector);
        this.tbody = this.table?.querySelector('tbody');
        this.options = {
            actions: ['delete', 'publish', 'draft'],
            onBulkAction: null,
            ...options
        };
        
        this.selectedRows = new Set();
        
        if (this.tbody) {
            this.init();
        }
    }

    init() {
        this.addBulkActionUI();
        this.addCheckboxes();
        this.setupEventListeners();
    }

    addBulkActionUI() {
        // 一括操作バーを追加
        const bulkBar = document.createElement('div');
        bulkBar.className = 'bulk-action-bar';
        bulkBar.innerHTML = `
            <div class="bulk-action-bar-content">
                <div class="bulk-action-info">
                    <i class="fas fa-check-square"></i>
                    <span id="selected-count">0</span> 件選択中
                </div>
                <div class="bulk-action-buttons">
                    ${this.options.actions.includes('publish') ? '<button class="bulk-btn bulk-btn-publish" data-action="publish"><i class="fas fa-eye"></i> 一括公開</button>' : ''}
                    ${this.options.actions.includes('draft') ? '<button class="bulk-btn bulk-btn-draft" data-action="draft"><i class="fas fa-eye-slash"></i> 一括下書き</button>' : ''}
                    ${this.options.actions.includes('delete') ? '<button class="bulk-btn bulk-btn-delete" data-action="delete"><i class="fas fa-trash"></i> 一括削除</button>' : ''}
                    <button class="bulk-btn bulk-btn-cancel" data-action="cancel"><i class="fas fa-times"></i> キャンセル</button>
                </div>
            </div>
        `;

        // テーブルの前に挿入
        this.table.parentElement.insertBefore(bulkBar, this.table);
        this.bulkBar = bulkBar;
    }

    addCheckboxes() {
        // ヘッダーにマスターチェックボックスを追加
        const thead = this.table.querySelector('thead tr');
        if (thead && !thead.querySelector('.bulk-checkbox-cell')) {
            const checkboxHeader = document.createElement('th');
            checkboxHeader.className = 'bulk-checkbox-cell';
            checkboxHeader.innerHTML = '<input type="checkbox" id="bulk-select-all" title="すべて選択">';
            checkboxHeader.style.width = '50px';
            thead.insertBefore(checkboxHeader, thead.firstChild);
        }

        // 各行にチェックボックスを追加
        this.tbody.querySelectorAll('tr').forEach(row => {
            if (!row.querySelector('.bulk-checkbox-cell')) {
                const checkboxCell = document.createElement('td');
                checkboxCell.className = 'bulk-checkbox-cell';
                checkboxCell.innerHTML = `<input type="checkbox" class="bulk-row-checkbox" value="${row.dataset.id}">`;
                row.insertBefore(checkboxCell, row.firstChild);
            }
        });
    }

    setupEventListeners() {
        // マスターチェックボックス
        const masterCheckbox = this.table.querySelector('#bulk-select-all');
        masterCheckbox?.addEventListener('change', (e) => {
            const checkboxes = this.tbody.querySelectorAll('.bulk-row-checkbox');
            checkboxes.forEach(cb => {
                cb.checked = e.target.checked;
                if (e.target.checked) {
                    this.selectedRows.add(cb.value);
                    cb.closest('tr').classList.add('row-selected');
                } else {
                    this.selectedRows.delete(cb.value);
                    cb.closest('tr').classList.remove('row-selected');
                }
            });
            this.updateBulkBar();
        });

        // 個別チェックボックス
        this.tbody.querySelectorAll('.bulk-row-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedRows.add(e.target.value);
                    e.target.closest('tr').classList.add('row-selected');
                } else {
                    this.selectedRows.delete(e.target.value);
                    e.target.closest('tr').classList.remove('row-selected');
                }
                this.updateBulkBar();
            });
        });

        // 一括操作ボタン
        this.bulkBar.querySelectorAll('.bulk-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const action = e.currentTarget.dataset.action;
                
                if (action === 'cancel') {
                    this.clearSelection();
                    return;
                }

                if (this.selectedRows.size === 0) {
                    toast.warning('選択なし', '操作する項目を選択してください');
                    return;
                }

                const confirmed = await this.confirmBulkAction(action);
                if (!confirmed) return;

                if (this.options.onBulkAction) {
                    await this.options.onBulkAction(action, Array.from(this.selectedRows));
                }
            });
        });
    }

    async confirmBulkAction(action) {
        const messages = {
            delete: `選択した ${this.selectedRows.size} 件を削除しますか？\nこの操作は元に戻せません。`,
            publish: `選択した ${this.selectedRows.size} 件を公開しますか？`,
            draft: `選択した ${this.selectedRows.size} 件を下書きにしますか？`
        };

        return confirm(messages[action] || `選択した ${this.selectedRows.size} 件に対して操作を実行しますか？`);
    }

    updateBulkBar() {
        const count = this.selectedRows.size;
        document.getElementById('selected-count').textContent = count;
        
        if (count > 0) {
            this.bulkBar.classList.add('active');
        } else {
            this.bulkBar.classList.remove('active');
        }
    }

    clearSelection() {
        this.selectedRows.clear();
        this.tbody.querySelectorAll('.bulk-row-checkbox').forEach(cb => {
            cb.checked = false;
            cb.closest('tr').classList.remove('row-selected');
        });
        const masterCheckbox = this.table.querySelector('#bulk-select-all');
        if (masterCheckbox) masterCheckbox.checked = false;
        this.updateBulkBar();
    }

    getSelectedIds() {
        return Array.from(this.selectedRows);
    }
}

window.BulkActionManager = BulkActionManager;

// ========================================
// CSVエクスポート
// ========================================
class CSVExporter {
    constructor(data, columns, filename = 'export.csv') {
        this.data = data;
        this.columns = columns;
        this.filename = filename;
    }

    export() {
        const csv = this.generateCSV();
        this.download(csv);
        toast.success('エクスポート完了', `${this.filename} をダウンロードしました`);
    }

    generateCSV() {
        // ヘッダー行
        const headers = this.columns.map(col => col.label || col.key).join(',');
        
        // データ行
        const rows = this.data.map(row => {
            return this.columns.map(col => {
                let value = row[col.key] || '';
                
                // CSVエスケープ処理
                if (typeof value === 'string') {
                    value = value.replace(/"/g, '""'); // ダブルクォートをエスケープ
                    if (value.includes(',') || value.includes('\n') || value.includes('"')) {
                        value = `"${value}"`; // カンマ・改行・クォートを含む場合は囲む
                    }
                }
                
                return value;
            }).join(',');
        });

        return [headers, ...rows].join('\n');
    }

    download(csvContent) {
        // BOM付きUTF-8（Excelで文字化けしないように）
        const bom = '\uFEFF';
        const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = this.filename;
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

/**
 * データをCSVでエクスポート
 * @param {Array} data - エクスポートするデータ
 * @param {Array} columns - カラム定義 [{key: 'title', label: 'タイトル'}, ...]
 * @param {string} filename - ファイル名
 */
window.exportToCSV = function(data, columns, filename = 'export.csv') {
    const exporter = new CSVExporter(data, columns, filename);
    exporter.export();
};

// ========================================
// 自動保存マネージャー
// ========================================
class AutoSaveManager {
    constructor(form, options = {}) {
        this.form = typeof form === 'string' ? document.querySelector(form) : form;
        this.options = {
            interval: 30000, // 30秒ごと
            storageKey: 'autosave_',
            onSave: null,
            onRestore: null,
            ...options
        };
        
        this.timer = null;
        this.isDirty = false;
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        // フォームの変更を監視
        this.form.addEventListener('input', () => {
            this.isDirty = true;
            this.scheduleAutoSave();
        });

        // 復元確認
        this.checkForAutoSave();
    }

    scheduleAutoSave() {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
            if (this.isDirty) {
                this.autoSave();
            }
        }, this.options.interval);
    }

    autoSave() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        const storageKey = this.options.storageKey + (this.form.id || 'default');
        localStorage.setItem(storageKey, JSON.stringify({
            data: data,
            timestamp: Date.now()
        }));

        this.isDirty = false;
        
        // 自動保存通知（控えめに）
        this.showAutoSaveIndicator();

        if (this.options.onSave) {
            this.options.onSave(data);
        }
    }

    showAutoSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'autosave-indicator';
        indicator.innerHTML = '<i class="fas fa-check"></i> 自動保存しました';
        document.body.appendChild(indicator);

        setTimeout(() => {
            indicator.classList.add('fade-out');
            setTimeout(() => indicator.remove(), 300);
        }, 2000);
    }

    checkForAutoSave() {
        const storageKey = this.options.storageKey + (this.form.id || 'default');
        const saved = localStorage.getItem(storageKey);

        if (saved) {
            const { data, timestamp } = JSON.parse(saved);
            const age = Date.now() - timestamp;
            
            // 24時間以内の自動保存データがあれば復元を提案
            if (age < 24 * 60 * 60 * 1000) {
                const minutes = Math.floor(age / 60000);
                const shouldRestore = confirm(`${minutes}分前の自動保存データがあります。復元しますか？`);
                
                if (shouldRestore) {
                    this.restore(data);
                } else {
                    this.clearAutoSave();
                }
            } else {
                this.clearAutoSave();
            }
        }
    }

    restore(data) {
        Object.entries(data).forEach(([key, value]) => {
            const field = this.form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = value;
            }
        });

        toast.info('復元完了', '自動保存データを復元しました');

        if (this.options.onRestore) {
            this.options.onRestore(data);
        }
    }

    clearAutoSave() {
        const storageKey = this.options.storageKey + (this.form.id || 'default');
        localStorage.removeItem(storageKey);
    }

    destroy() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }
}

window.AutoSaveManager = AutoSaveManager;

console.log('✅ Phase 3機能が読み込まれました（ドラッグ&ドロップ、一括操作、CSV、自動保存）');
