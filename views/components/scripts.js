// views/components/scripts.js - COMPLETE WITH VIEW NOTES
function generateScripts() {
  return `
    <script>
        // ============================================================================
        // FILTER TABLE FUNCTIONALITY
        // ============================================================================
        function filterTable() {
            const input = document.getElementById('searchInput');
            const filter = input.value.toUpperCase();
            const table = document.getElementById('licenseTable');
            const tr = table.getElementsByTagName('tr');
            let visibleCount = 0;
            const totalCount = tr.length - 1;
            
            for (let i = 1; i < tr.length; i++) {
                const td = tr[i].getElementsByTagName('td');
                let found = false;
                
                for (let j = 0; j < td.length; j++) {
                    if (td[j]) {
                        const txtValue = td[j].textContent || td[j].innerText;
                        if (txtValue.toUpperCase().indexOf(filter) > -1) {
                            found = true;
                            break;
                        }
                    }
                }
                
                tr[i].style.display = found ? '' : 'none';
                if (found) visibleCount++;
            }
            
            const header = document.getElementById('license-list-header');
            if (header) {
                if (visibleCount < totalCount) {
                    header.innerHTML = '📋 License List (' + visibleCount + ' of ' + totalCount + ' shown)';
                } else {
                    header.innerHTML = '📋 License List (' + totalCount + ')';
                }
            }
        }
        
        // ============================================================================
        // COPY TO CLIPBOARD FUNCTIONALITY
        // ============================================================================
        function copyToClipboard(text, label) {
            label = label || 'Text';
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    showNotification('✅ Copied!', label + ': ' + (text.length > 50 ? text.substring(0, 50) + '...' : text), 'success');
                }).catch(err => {
                    console.error('Clipboard error:', err);
                    fallbackCopy(text, label);
                });
            } else {
                fallbackCopy(text, label);
            }
        }
        
        function fallbackCopy(text, label) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            textarea.style.top = '0';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    showNotification('✅ Copied!', label + ' copied successfully', 'success');
                } else {
                    showNotification('❌ Copy Failed', 'Please copy manually', 'error');
                }
            } catch (err) {
                console.error('Fallback copy error:', err);
                showNotification('❌ Copy Failed', 'Please copy manually', 'error');
            }
            
            document.body.removeChild(textarea);
        }
        
        // ============================================================================
        // NOTIFICATION SYSTEM
        // ============================================================================
        function showNotification(title, message, type) {
            message = message || '';
            type = type || 'success';
            
            const colors = {
                success: 'linear-gradient(45deg, #2ecc71, #27ae60)',
                error: 'linear-gradient(45deg, #e74c3c, #c0392b)',
                info: 'linear-gradient(45deg, #00aaee, #0099cc)',
                warning: 'linear-gradient(45deg, #ffa502, #ff7f00)'
            };
            
            const notification = document.createElement('div');
            notification.innerHTML = 
                '<div style="font-weight: 700; font-size: 15px; margin-bottom: 5px;">' + title + '</div>' +
                (message ? '<div style="font-size: 12px; opacity: 0.9; word-break: break-all;">' + message + '</div>' : '');
            
            notification.style.cssText = 
                'position: fixed;' +
                'top: 20px;' +
                'right: 20px;' +
                'background: ' + (colors[type] || colors.success) + ';' +
                'color: white;' +
                'padding: 15px 25px;' +
                'border-radius: 12px;' +
                'box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);' +
                'z-index: 10001;' +
                'animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55), fadeOut 0.3s 2.7s;' +
                'font-size: 14px;' +
                'font-weight: 600;' +
                'max-width: 400px;' +
                'cursor: pointer;';
            
            notification.onclick = () => notification.remove();
            
            document.body.appendChild(notification);
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 3000);
        }
        
        // ============================================================================
        // BAN MODAL FUNCTIONALITY
        // ============================================================================
        function showBanModal(license, deviceName, hwid) {
            document.getElementById('banLicenseKey').value = license;
            document.getElementById('banReason').value = '';
            
            const info = document.getElementById('banModalInfo');
            info.innerHTML = 
                '<strong>License:</strong> ' + license + '<br>' +
                '<strong>Device:</strong> ' + (deviceName || 'Unknown') + '<br>' +
                (hwid ? '<strong>HWID:</strong> ' + hwid.substring(0, 30) + '...' : '');
            
            document.getElementById('banModal').style.display = 'block';
            
            setTimeout(() => {
                const reasonInput = document.getElementById('banReason');
                if (reasonInput) reasonInput.focus();
            }, 100);
        }
        
        function closeBanModal() {
            document.getElementById('banModal').style.display = 'none';
        }
        
        // ============================================================================
        // NOTE MODAL FUNCTIONALITY
        // ============================================================================
        function showNoteModal(license, deviceName, existingNotes) {
            document.getElementById('noteLicenseKey').value = license;
            document.getElementById('noteText').value = '';
            
            const info = document.getElementById('noteModalInfo');
            info.innerHTML = 
                '<strong>License:</strong> ' + license + '<br>' +
                '<strong>Device:</strong> ' + (deviceName || 'Unknown') + '<br>' +
                '<strong>Existing Notes:</strong> ' + (existingNotes || 0);
            
            document.getElementById('noteModal').style.display = 'block';
            
            setTimeout(() => {
                const noteTextarea = document.getElementById('noteText');
                if (noteTextarea) {
                    noteTextarea.focus();
                }
            }, 100);
        }
        
        function closeNoteModal() {
            document.getElementById('noteModal').style.display = 'none';
        }
        
        // ============================================================================
        // VIEW NOTES MODAL FUNCTIONALITY
        // ============================================================================
        function showViewNotesModal(license, notesData) {
            try {
                let notes = [];
                
                // Handle different input formats
                if (Array.isArray(notesData)) {
                    notes = notesData;
                } else if (typeof notesData === 'string') {
                    try {
                        notes = JSON.parse(notesData);
                    } catch (e) {
                        notes = [];
                    }
                }
                
                document.getElementById('viewNotesLicense').innerHTML = 
                    '<strong>License:</strong> ' + license + ' <span style="color: #8b8d94; font-weight: normal;">(' + notes.length + ' note(s))</span>';
                
                const notesContent = document.getElementById('viewNotesContent');
                
                if (notes.length === 0) {
                    notesContent.innerHTML = '<p style="color: #8b8d94; text-align: center; padding: 20px;">No notes available</p>';
                } else {
                    notesContent.innerHTML = notes.map((noteObj, index) => {
                        const date = noteObj.addedAt ? new Date(noteObj.addedAt).toLocaleString() : 'Unknown date';
                        const author = noteObj.addedBy || 'Unknown';
                        const note = noteObj.note || noteObj;
                        
                        return '<div style="background: rgba(26, 29, 35, 0.8); border-left: 4px solid #00aaee; border-radius: 8px; padding: 15px; margin-bottom: 12px;">' +
                            '<div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 12px;">' +
                            '<span style="color: #00aaee; font-weight: 600;">📝 Note #' + (index + 1) + '</span>' +
                            '<span style="color: #8b8d94;">' + date + '</span>' +
                            '</div>' +
                            '<div style="color: #e4e6eb; margin-bottom: 8px; line-height: 1.5;">' + note + '</div>' +
                            '<div style="font-size: 11px; color: #8b8d94;">👤 Added by: ' + author + '</div>' +
                            '</div>';
                    }).join('');
                }
                
                document.getElementById('viewNotesModal').style.display = 'block';
            } catch (error) {
                console.error('Error displaying notes:', error);
                showNotification('❌ Error', 'Failed to load notes: ' + error.message, 'error');
            }
        }

        function closeViewNotesModal() {
            document.getElementById('viewNotesModal').style.display = 'none';
        }
        
        // ============================================================================
        // MODAL EVENT HANDLERS
        // ============================================================================
        window.onclick = function(event) {
            if (event.target.className === 'modal') {
                event.target.style.display = 'none';
            }
        }
        
        // ============================================================================
        // KEYBOARD SHORTCUTS
        // ============================================================================
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' || event.key === 'Esc') {
                closeBanModal();
                closeNoteModal();
                closeViewNotesModal();
            }
            
            if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
                event.preventDefault();
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
        });
        
        // ============================================================================
        // SCROLL TO TOP BUTTON
        // ============================================================================
        function addScrollToTop() {
            const scrollBtn = document.createElement('button');
            scrollBtn.innerHTML = '⬆️';
            scrollBtn.className = 'scroll-top';
            scrollBtn.title = 'Scroll to top';
            
            scrollBtn.onclick = () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            
            document.body.appendChild(scrollBtn);
            
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    scrollBtn.style.display = 'block';
                    setTimeout(() => scrollBtn.style.opacity = '1', 10);
                } else {
                    scrollBtn.style.opacity = '0';
                    setTimeout(() => scrollBtn.style.display = 'none', 300);
                }
            });
        }
            
        
        // ============================================================================
        // SEARCH AUTO-SAVE
        // ============================================================================
        function setupSearchAutoSave() {
            const searchInput = document.getElementById('searchInput');
            if (!searchInput) return;
            
            const savedSearch = localStorage.getItem('adminLicenseSearch');
            if (savedSearch) {
                searchInput.value = savedSearch;
                filterTable();
            }
            
            searchInput.addEventListener('input', function() {
                localStorage.setItem('adminLicenseSearch', this.value);
            });
            
            const searchBox = searchInput.parentElement;
            const clearBtn = document.createElement('span');
            clearBtn.innerHTML = '✕';
            clearBtn.style.cssText = 
                'position: absolute;' +
                'right: 45px;' +
                'top: 50%;' +
                'transform: translateY(-50%);' +
                'cursor: pointer;' +
                'color: #8b8d94;' +
                'font-size: 18px;' +
                'font-weight: bold;' +
                'transition: color 0.2s;' +
                'display: none;' +
                'z-index: 10;';
            
            clearBtn.onclick = () => {
                searchInput.value = '';
                localStorage.removeItem('adminLicenseSearch');
                filterTable();
                clearBtn.style.display = 'none';
            };
            
            clearBtn.onmouseenter = () => clearBtn.style.color = '#00aaee';
            clearBtn.onmouseleave = () => clearBtn.style.color = '#8b8d94';
            
            searchBox.appendChild(clearBtn);
            
            searchInput.addEventListener('input', function() {
                clearBtn.style.display = this.value ? 'block' : 'none';
            });
            
            if (searchInput.value) {
                clearBtn.style.display = 'block';
            }
        }
        
        // ============================================================================
        // ANIMATION STYLES
        // ============================================================================
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            #licenseTable tbody tr {
                transition: background 0.2s, transform 0.2s;
            }
            .license-key:active,
            .hwid-container:active {
                transform: scale(0.98) !important;
            }
        \`;
        document.head.appendChild(style);
        
        // ============================================================================
        // INITIALIZE ON PAGE LOAD
        // ============================================================================
        document.addEventListener('DOMContentLoaded', function() {
            console.log('%c🔐 Ultra License System', 'font-size: 20px; font-weight: bold; color: #00aaee;');
            console.log('%cAdmin Dashboard Loaded', 'color: #2ecc71; font-weight: bold;');
            console.log('%cKeyboard Shortcuts:', 'font-weight: bold;');
            console.log('  • Ctrl+F: Focus search');
            console.log('  • ESC: Close modals');
            
            addScrollToTop();
            setupSearchAutoSave();
            
            const hwidContainers = document.querySelectorAll('.hwid-container');
            hwidContainers.forEach(container => {
                container.addEventListener('mouseenter', function() {
                    this.style.transition = 'all 0.3s';
                });
            });
            
            console.log('✅ All features initialized');
        });
        
        // ============================================================================
        // FORM VALIDATION
        // ============================================================================
        document.getElementById('banForm').addEventListener('submit', function(e) {
            const reason = document.getElementById('banReason').value.trim();
            if (!reason) {
                e.preventDefault();
                showNotification('❌ Error', 'Please provide a ban reason', 'error');
                return false;
            }
        });
        
        document.getElementById('noteForm').addEventListener('submit', function(e) {
            const note = document.getElementById('noteText').value.trim();
            if (!note) {
                e.preventDefault();
                showNotification('❌ Error', 'Please enter a note', 'error');
                return false;
            }
        });
    </script>
  `;
}

module.exports = { generateScripts };
