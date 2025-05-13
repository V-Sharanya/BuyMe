const API_BASE_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  if (!user.user_id) {
    alert('Please log in to view your bid history.');
    window.location.href = 'login.html';
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/bids/user/${user.user_id}`);
    const data = await response.json();
    if (data.success) {
      displayBidHistory(data.bids);
    } else {
      document.getElementById('bidHistoryContainer').innerHTML = '<p>No bid history found.</p>';
    }
  } catch (err) {
    document.getElementById('bidHistoryContainer').innerHTML = '<p>Error loading bid history.</p>';
  }
});

function displayBidHistory(bids) {
  const container = document.getElementById('bidHistoryContainer');
  if (!bids.length) {
    container.innerHTML = '<p>No bids found.</p>';
    return;
  }
  let html = '<table><tr><th>Item</th><th>Bid Amount</th><th>Bid Time</th><th>Status</th></tr>';
  bids.forEach(bid => {
    html += `
      <tr>
        <td>
          <img src="${bid.item_image ? 'http://localhost:5000' + bid.item_image : 'placeholder.jpg'}" alt="${bid.item_name}" style="width:40px;height:40px;vertical-align:middle;margin-right:8px;">
          ${bid.item_name}
        </td>
        <td>$${parseFloat(bid.bid_amount).toFixed(2)}</td>
        <td>${new Date(bid.bid_time).toLocaleString()}</td>
        <td>${bid.status === 'active' ? 'Ongoing' : 'Completed'}</td>
      </tr>
    `;
  });
  html += '</table>';
  container.innerHTML = html;
}