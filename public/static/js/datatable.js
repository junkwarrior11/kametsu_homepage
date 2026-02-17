/**
 * データテーブル拡張機能
 * 作成日: 2026-02-17
 * バージョン: 1.0
 * 
 * 機能:
 * - 検索・フィルター
 * - ソート（昇順・降順）
 * - ページネーション
 * - カラム表示/非表示切り替え
 * - データエクスポート（CSV）
 * - レスポンシブ対応（モバイルでカード表示）
 * 
 * 使用例:
 * const table = new DataTable('#myTable', {
 *   searchable: true,
 *   sortable: true,
 *   pagination: true,
 *   perPage: 10
 * });
 */

class DataTable {
    constructor(selector, options = {}) {
        this.table = typeof selector === 'string' ? document.querySelector(selector) : selector;
        
        if (!this.table) {
            console.error('DataTable: Table not found');
            return;
        }
        
        // デフォルトオプション
        this.options = {
            searchable: true,
            sortable: true,
            pagination: true,
            perPage: 10,
            perPageOptions: [5, 10, 25, 50, 100],
            responsive: true,
            exportable: true,
            columnToggle: false,
            labels: {
                search: '検索:',
                perPage: '表示件数:',
                info: '{start} - {end} 件 / 全 {total} 件',
                noData: 'データがありません',
                previous: '前へ',
                next: '次へ',
                export: 'CSVエクスポート'
            },
            ...options
        };
        
        // 内部状態
        this.currentPage = 1;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.searchTerm = '';
        this.data = [];
        this.filteredData = [];
        
        this.init();
    }
    
    /**
     * 初期化
     */
    init() {
        // テーブルをラップ
        this.wrapTable();
        
        // データを抽出
        this.extractData();
        
        // UIを構築
        this.buildUI();
        
        // イベントを設定
        this.attachEvents();
        
        // 初期レンダリング
        this.render();
    }
    
    /**
     * テーブルをラッパーで囲む
     */
    wrapTable() {
        const wrapper = document.createElement('div');
        wrapper.className = 'datatable-wrapper';
        this.table.parentNode.insertBefore(wrapper, this.table);
        wrapper.appendChild(this.table);
        this.wrapper = wrapper;
    }
    
    /**
     * データを抽出
     */
    extractData() {
        const thead = this.table.querySelector('thead');
        const tbody = this.table.querySelector('tbody');
        
        if (!thead || !tbody) {
            console.error('DataTable: Missing thead or tbody');
            return;
        }
        
        // ヘッダー情報を取得
        this.headers = Array.from(thead.querySelectorAll('th')).map((th, index) => ({
            index,
            text: th.textContent.trim(),
            sortable: this.options.sortable && !th.hasAttribute('data-sortable-false'),
            searchable: this.options.searchable && !th.hasAttribute('data-searchable-false')
        }));
        
        // 行データを取得
        this.data = Array.from(tbody.querySelectorAll('tr')).map((tr, index) => {
            const cells = Array.from(tr.querySelectorAll('td'));
            return {
                index,
                element: tr,
                cells: cells.map((td, cellIndex) => ({
                    html: td.innerHTML,
                    text: td.textContent.trim(),
                    element: td
                })),
                visible: true
            };
        });
        
        this.filteredData = [...this.data];
    }
    
    /**
     * UIを構築
     */
    buildUI() {
        // トップコントロール
        const topControls = document.createElement('div');
        topControls.className = 'datatable-top';
        
        // 検索ボックス
        if (this.options.searchable) {
            const searchContainer = document.createElement('div');
            searchContainer.className = 'datatable-search';
            searchContainer.innerHTML = `
                <label>
                    ${this.options.labels.search}
                    <input type="text" 
                           class="datatable-search-input" 
                           placeholder="キーワードを入力..."
                           aria-label="テーブル内を検索">
                </label>
            `;
            topControls.appendChild(searchContainer);
        }
        
        // 表示件数セレクター
        if (this.options.pagination) {
            const perPageContainer = document.createElement('div');
            perPageContainer.className = 'datatable-perpage';
            perPageContainer.innerHTML = `
                <label>
                    ${this.options.labels.perPage}
                    <select class="datatable-perpage-select" aria-label="1ページの表示件数">
                        ${this.options.perPageOptions.map(num => 
                            `<option value="${num}" ${num === this.options.perPage ? 'selected' : ''}>${num}</option>`
                        ).join('')}
                    </select>
                </label>
            `;
            topControls.appendChild(perPageContainer);
        }
        
        // エクスポートボタン
        if (this.options.exportable) {
            const exportBtn = document.createElement('button');
            exportBtn.className = 'datatable-export-btn btn-secondary';
            exportBtn.innerHTML = `<i class="fas fa-download"></i> ${this.options.labels.export}`;
            exportBtn.type = 'button';
            topControls.appendChild(exportBtn);
        }
        
        this.wrapper.insertBefore(topControls, this.table);
        
        // ボトムコントロール
        const bottomControls = document.createElement('div');
        bottomControls.className = 'datatable-bottom';
        
        // 情報表示
        const info = document.createElement('div');
        info.className = 'datatable-info';
        info.setAttribute('role', 'status');
        info.setAttribute('aria-live', 'polite');
        bottomControls.appendChild(info);
        
        // ページネーション
        if (this.options.pagination) {
            const pagination = document.createElement('div');
            pagination.className = 'datatable-pagination';
            pagination.setAttribute('role', 'navigation');
            pagination.setAttribute('aria-label', 'ページネーション');
            bottomControls.appendChild(pagination);
        }
        
        this.wrapper.appendChild(bottomControls);
        
        // ソート可能なヘッダーにアイコンを追加
        if (this.options.sortable) {
            this.headers.forEach((header, index) => {
                if (header.sortable) {
                    const th = this.table.querySelector('thead').querySelectorAll('th')[index];
                    th.classList.add('datatable-sortable');
                    th.innerHTML += ' <i class="fas fa-sort datatable-sort-icon"></i>';
                    th.style.cursor = 'pointer';
                }
            });
        }
    }
    
    /**
     * イベントを設定
     */
    attachEvents() {
        // 検索
        if (this.options.searchable) {
            const searchInput = this.wrapper.querySelector('.datatable-search-input');
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.filter();
                this.render();
            });
        }
        
        // 表示件数変更
        if (this.options.pagination) {
            const perPageSelect = this.wrapper.querySelector('.datatable-perpage-select');
            perPageSelect.addEventListener('change', (e) => {
                this.options.perPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.render();
            });
        }
        
        // ソート
        if (this.options.sortable) {
            const headers = this.table.querySelectorAll('thead th.datatable-sortable');
            headers.forEach((th, index) => {
                th.addEventListener('click', () => {
                    this.sort(index);
                });
            });
        }
        
        // エクスポート
        if (this.options.exportable) {
            const exportBtn = this.wrapper.querySelector('.datatable-export-btn');
            exportBtn.addEventListener('click', () => {
                this.exportCSV();
            });
        }
    }
    
    /**
     * フィルター実行
     */
    filter() {
        if (!this.searchTerm) {
            this.filteredData = [...this.data];
            return;
        }
        
        this.filteredData = this.data.filter(row => {
            return row.cells.some((cell, cellIndex) => {
                const header = this.headers[cellIndex];
                return header.searchable && cell.text.toLowerCase().includes(this.searchTerm);
            });
        });
    }
    
    /**
     * ソート実行
     */
    sort(columnIndex) {
        // ソート方向の切り替え
        if (this.sortColumn === columnIndex) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnIndex;
            this.sortDirection = 'asc';
        }
        
        // ソート実行
        this.filteredData.sort((a, b) => {
            const aValue = a.cells[columnIndex].text;
            const bValue = b.cells[columnIndex].text;
            
            // 数値として比較を試みる
            const aNum = parseFloat(aValue.replace(/[,円]/g, ''));
            const bNum = parseFloat(bValue.replace(/[,円]/g, ''));
            
            let comparison;
            if (!isNaN(aNum) && !isNaN(bNum)) {
                comparison = aNum - bNum;
            } else {
                comparison = aValue.localeCompare(bValue, 'ja');
            }
            
            return this.sortDirection === 'asc' ? comparison : -comparison;
        });
        
        this.currentPage = 1;
        this.render();
    }
    
    /**
     * レンダリング
     */
    render() {
        // ソートアイコンを更新
        if (this.options.sortable) {
            const headers = this.table.querySelectorAll('thead th.datatable-sortable');
            headers.forEach((th, index) => {
                const icon = th.querySelector('.datatable-sort-icon');
                if (this.sortColumn === index) {
                    icon.className = `fas fa-sort-${this.sortDirection === 'asc' ? 'up' : 'down'} datatable-sort-icon`;
                } else {
                    icon.className = 'fas fa-sort datatable-sort-icon';
                }
            });
        }
        
        // ページネーション計算
        const totalRows = this.filteredData.length;
        const totalPages = Math.ceil(totalRows / this.options.perPage);
        this.currentPage = Math.min(this.currentPage, totalPages || 1);
        
        const start = (this.currentPage - 1) * this.options.perPage;
        const end = Math.min(start + this.options.perPage, totalRows);
        
        // 行の表示/非表示を切り替え
        const tbody = this.table.querySelector('tbody');
        tbody.innerHTML = '';
        
        if (this.filteredData.length === 0) {
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = `<td colspan="${this.headers.length}" style="text-align: center; color: var(--text-light); padding: var(--space-8);">${this.options.labels.noData}</td>`;
            tbody.appendChild(noDataRow);
        } else {
            this.filteredData.slice(start, end).forEach(row => {
                const tr = row.element.cloneNode(true);
                tbody.appendChild(tr);
            });
        }
        
        // 情報表示を更新
        const info = this.wrapper.querySelector('.datatable-info');
        if (totalRows === 0) {
            info.textContent = this.options.labels.noData;
        } else {
            info.textContent = this.options.labels.info
                .replace('{start}', start + 1)
                .replace('{end}', end)
                .replace('{total}', totalRows);
        }
        
        // ページネーションを更新
        if (this.options.pagination) {
            this.renderPagination(totalPages);
        }
    }
    
    /**
     * ページネーションをレンダリング
     */
    renderPagination(totalPages) {
        const paginationContainer = this.wrapper.querySelector('.datatable-pagination');
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let html = `
            <button class="datatable-page-btn" data-page="prev" ${this.currentPage === 1 ? 'disabled' : ''} aria-label="前のページ">
                <i class="fas fa-chevron-left"></i> ${this.options.labels.previous}
            </button>
        `;
        
        // ページ番号ボタン
        const maxButtons = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);
        
        if (endPage - startPage < maxButtons - 1) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }
        
        if (startPage > 1) {
            html += `<button class="datatable-page-btn" data-page="1">1</button>`;
            if (startPage > 2) {
                html += `<span class="datatable-ellipsis">...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="datatable-page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span class="datatable-ellipsis">...</span>`;
            }
            html += `<button class="datatable-page-btn" data-page="${totalPages}">${totalPages}</button>`;
        }
        
        html += `
            <button class="datatable-page-btn" data-page="next" ${this.currentPage === totalPages ? 'disabled' : ''} aria-label="次のページ">
                ${this.options.labels.next} <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        paginationContainer.innerHTML = html;
        
        // ページボタンのイベント
        paginationContainer.querySelectorAll('.datatable-page-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page === 'prev') {
                    this.currentPage = Math.max(1, this.currentPage - 1);
                } else if (page === 'next') {
                    this.currentPage = Math.min(totalPages, this.currentPage + 1);
                } else {
                    this.currentPage = parseInt(page);
                }
                this.render();
            });
        });
    }
    
    /**
     * CSVエクスポート
     */
    exportCSV() {
        // ヘッダー行
        const headers = this.headers.map(h => h.text);
        let csv = headers.map(h => `"${h}"`).join(',') + '\n';
        
        // データ行
        this.filteredData.forEach(row => {
            const rowData = row.cells.map(cell => {
                // HTMLタグを除去
                const text = cell.text.replace(/"/g, '""');
                return `"${text}"`;
            });
            csv += rowData.join(',') + '\n';
        });
        
        // ダウンロード
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `table_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    /**
     * データを再読み込み
     */
    reload() {
        this.extractData();
        this.filter();
        this.render();
    }
    
    /**
     * 破棄
     */
    destroy() {
        // ラッパーを削除してテーブルを復元
        const parent = this.wrapper.parentNode;
        parent.insertBefore(this.table, this.wrapper);
        parent.removeChild(this.wrapper);
    }
}

// グローバルスコープに公開
if (typeof window !== 'undefined') {
    window.DataTable = DataTable;
}
