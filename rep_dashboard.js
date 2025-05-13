const API_BASE_URL = 'http://localhost:5000';


// Fetch queries
async function fetchQueries() {
    try {
        

        console.log('Fetching queries...');

        const repId = 1; // Or dynamically get this later from sessionStorage or a login system

        const response = await fetch(`${API_BASE_URL}/api/queries/rep?rep_id=${repId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        
        

        console.log('Query response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to fetch queries: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Queries data received:', data);
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch queries');
        }
        
        displayQueries(data.queries || []);
    } catch (error) {
        console.error('Error fetching queries:', error);
        document.getElementById('queryList').innerHTML = `
            <div class="error-message">
                <p>Failed to fetch queries: ${error.message}</p>
                <button onclick="fetchQueries()">Try Again</button>
            </div>
        `;
    }
}

function displayQueries(queries) {
    const queryList = document.getElementById('queryList');
    queryList.innerHTML = '';

    if (queries.length === 0) {
        queryList.innerHTML = '<div class="no-queries">No queries found</div>';
        return;
    }

    queries.forEach(query => {
        const queryItem = document.createElement('div');
        queryItem.className = 'query-item';
        queryItem.innerHTML = `
            <div class="query-header">
                <div>
                    <strong>From:</strong> ${query.email}
                    ${query.user_name ? ` (${query.user_name})` : ''}
                </div>
                <div>
                    <span class="query-status status-${query.status}">${query.status.replace('_', ' ')}</span>
                </div>
            </div>
            <div class="query-text">
                <strong>Query:</strong> ${query.query_text}
            </div>
            <div class="query-meta">
                <small>Submitted: ${new Date(query.created_at).toLocaleString()}</small>
            </div>
            ${query.response ? `
                <div class="query-response">
                    <strong>Response:</strong> ${query.response}
                    <div>
                        <small>Resolved by: ${query.rep_name || 'Unknown'}</small>
                        ${query.resolved_at ? `<small> on ${new Date(query.resolved_at).toLocaleString()}</small>` : ''}
                    </div>
                </div>
            ` : `
                <div class="response-form">
                    <textarea id="response-${query.query_id}" placeholder="Enter your response..."></textarea>
                    <select id="status-${query.query_id}">
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </select>
                    <button onclick="submitResponse(${query.query_id})">Submit Response</button>
                </div>
            `}
        `;
        queryList.appendChild(queryItem);
    });
}

async function submitResponse(queryId) {
    const responseElement = document.getElementById(`response-${queryId}`);
    const statusElement = document.getElementById(`status-${queryId}`);
    
    if (!responseElement || !statusElement) {
        console.error('Could not find response or status elements');
        return;
    }
    
    const response = responseElement.value;
    const status = statusElement.value;

    if (!response) {
        alert('Please enter a response');
        return;
    }

    try {
        console.log('Submitting response for query:', queryId);
        console.log('Data:', { status, response });
        
        const result = await fetch(`${API_BASE_URL}/api/queries/${queryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status, response }),
            credentials: 'include'
        });

        const data = await result.json();
        console.log('Response submission result:', data);
        
        if (data.success) {
            alert('Response submitted successfully');
            fetchQueries(); // Refresh the query list
        } else {
            alert('Failed to submit response: ' + data.message);
        }
    } catch (error) {
        console.error('Error submitting response:', error);
        alert('An error occurred while submitting the response');
    }
}

// Initialize dashboard
window.onload = async function() {
    console.log('Dashboard initializing...');
    await fetchQueries();
    
    // Set up auto-refresh
    setInterval(fetchQueries, 60000); // Refresh every minute
};

// Logout functionality
document.getElementById('logout').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Call logout API if available
    fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    }).catch(err => console.error('Logout API error:', err));
    
    // Clear session storage
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
});