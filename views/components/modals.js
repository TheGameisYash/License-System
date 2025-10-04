// views/components/modals.js - COMPLETE WITH VIEW NOTES MODAL
function generateModals() {
  return `
    <!-- Ban License Modal -->
    <div id="banModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeBanModal()">&times;</span>
            <h2 style="color: #ff4757; margin-bottom: 20px;">🚫 Ban License</h2>
            <div id="banModalInfo" style="margin-bottom: 15px; padding: 12px; background: rgba(255, 71, 87, 0.1); border-radius: 8px; font-size: 13px;"></div>
            <form method="post" action="/admin/ban-license" id="banForm">
                <input type="hidden" name="license" id="banLicenseKey" />
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; color: #a0a3a8; font-weight: 600;">Reason:</label>
                    <input name="reason" id="banReason" placeholder="Why are you banning this license?" required style="width: 100%;" />
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; color: #a0a3a8; font-weight: 600;">Duration (days):</label>
                    <input name="duration" type="number" placeholder="Leave empty for permanent ban" style="width: 100%;" />
                    <div style="font-size: 11px; color: #8b8d94; margin-top: 4px;">💡 Empty = Permanent, 7 = 7 days, 30 = 30 days</div>
                </div>
                <button type="submit" class="btn btn-danger" style="width: 100%;">Ban License</button>
            </form>
        </div>
    </div>
    
    <!-- Add Note Modal -->
    <div id="noteModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeNoteModal()">&times;</span>
            <h2 style="color: #00aaee; margin-bottom: 20px;">📝 Add Note</h2>
            <div id="noteModalInfo" style="margin-bottom: 15px; padding: 12px; background: rgba(0, 170, 238, 0.1); border-radius: 8px; font-size: 13px;"></div>
            <form method="post" action="/admin/add-license-note" id="noteForm">
                <input type="hidden" name="license" id="noteLicenseKey" />
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; color: #a0a3a8; font-weight: 600;">Note:</label>
                    <textarea name="note" id="noteText" placeholder="Add a note about this license (e.g., customer name, issue, etc.)..." required style="width: 100%; min-height: 120px; resize: vertical;"></textarea>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Add Note</button>
            </form>
        </div>
    </div>
    
    <!-- View Notes Modal -->
    <div id="viewNotesModal" class="modal">
        <div class="modal-content" style="max-width: 700px;">
            <span class="close" onclick="closeViewNotesModal()">&times;</span>
            <h2 style="color: #00aaee; margin-bottom: 20px;">👁️ License Notes</h2>
            <div id="viewNotesLicense" style="margin-bottom: 15px; padding: 12px; background: rgba(0, 170, 238, 0.1); border-radius: 8px; font-size: 13px; font-weight: 600; font-family: monospace;"></div>
            <div id="viewNotesContent" style="max-height: 400px; overflow-y: auto; padding-right: 10px;">
                <!-- Notes will be inserted here -->
            </div>
            <button onclick="closeViewNotesModal()" class="btn btn-primary" style="width: 100%; margin-top: 15px;">Close</button>
        </div>
    </div>
  `;
}

module.exports = { generateModals };
