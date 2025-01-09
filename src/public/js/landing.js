// Announcement Bar Functions
function closeAnnouncement() {
    const announcementBar = document.getElementById('announcement-bar');
    announcementBar.style.display = 'none';
    localStorage.setItem('announcementClosed', 'true');
}

function initAnnouncement() {
    if (localStorage.getItem('announcementClosed') === 'true') {
        document.getElementById('announcement-bar').style.display = 'none';
    }
}

// Initialize all landing page functions
document.addEventListener('DOMContentLoaded', function() {
    initAnnouncement();
});