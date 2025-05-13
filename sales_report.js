document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = 'http://localhost:5000';

    // Fetch all auctions data
    async function fetchAuctionData() {
        try {
            // Fetch auctions
            const auctionsResponse = await fetch(`${API_BASE_URL}/pi/auctions/all`);
            if (!auctionsResponse.ok) {
                throw new Error(`HTTP error! status: ${auctionsResponse.status}`);
            }
            
            const auctionsData = await auctionsResponse.json();
            if (!auctionsData.success || !auctionsData.auctions) {
                throw new Error('Invalid auctions response format');
            }
            
            // Filter completed auctions
            const now = new Date();
            const completedAuctions = auctionsData.auctions.filter(auction => 
                new Date(auction.end_time) < now
            );
            
            // Fetch bid data for each completed auction
            const auctionsWithBids = await Promise.all(completedAuctions.map(async (auction) => {
                try {
                    const bidsResponse = await fetch(`${API_BASE_URL}/api/bids/auction/${auction.auction_id}`);
                    if (!bidsResponse.ok) {
                        return { ...auction, bids: [] };
                    }
                    
                    const bids = await bidsResponse.json();
                    
                    // Sort bids by amount desc, then by earliest time
                    const sortedBids = bids.sort((a, b) => {
                        const amountA = parseFloat(a.bid_amount) || 0;
                        const amountB = parseFloat(b.bid_amount) || 0;
                        if (amountB === amountA) {
                            return new Date(a.bid_time) - new Date(b.bid_time);
                        }
                        return amountB - amountA;
                    });
                    
                    // Get the winning bid (highest bid that meets or exceeds starting price)
                    const highestBid = sortedBids.length > 0 ? sortedBids[0] : null;
                    const winningBid = highestBid && parseFloat(highestBid.bid_amount) >= parseFloat(auction.starting_price) 
                        ? highestBid 
                        : null;
                    
                    return {
                        ...auction,
                        bids: sortedBids,
                        winningBid: winningBid,
                        winner: winningBid ? {
                            username: winningBid.username || 'Anonymous',
                            userId: winningBid.user_id,
                            bidAmount: parseFloat(winningBid.bid_amount)
                        } : null
                    };
                } catch (error) {
                    console.error(`Error fetching bids for auction ${auction.auction_id}:`, error);
                    return { ...auction, bids: [] };
                }
            }));
            
            // Filter auctions that have a winning bid
            const completedAuctionsWithWinners = auctionsWithBids.filter(auction => auction.winningBid);
            
            // Calculate and display metrics
            calculateAndDisplayMetrics(completedAuctionsWithWinners);
            
        } catch (error) {
            console.error('Error fetching auction data:', error);
            document.getElementById('totalEarnings').textContent = 'Error loading data';
            
            const errorMessage = `
                <div class="error-message">
                    <p>Unable to connect to the server. Please make sure the backend server is running.</p>
                    <p>Error details: ${error.message}</p>
                </div>
            `;
            
            document.getElementById('itemEarnings').innerHTML = errorMessage;
            document.getElementById('buyerEarnings').innerHTML = errorMessage;
            document.getElementById('topItems').innerHTML = errorMessage;
            document.getElementById('topBuyers').innerHTML = errorMessage;
        }
    }

    // Calculate and display all metrics
    function calculateAndDisplayMetrics(completedAuctions) {
        // 1. Calculate total earnings (sum of winning bids)
        const totalEarnings = completedAuctions.reduce((total, auction) => {
            return total + (auction.winner ? auction.winner.bidAmount : 0);
        }, 0);
        
        document.getElementById('totalEarnings').textContent = `$${totalEarnings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

        // 2. Calculate earnings by item
        const itemEarningsElement = document.getElementById('itemEarnings');
        itemEarningsElement.innerHTML = '';
        
        completedAuctions.forEach(auction => {
            if (auction.winner) {
                const listItem = document.createElement('li');
                listItem.textContent = `${auction.item_name}: $${auction.winner.bidAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                itemEarningsElement.appendChild(listItem);
            }
        });

        // 3. Calculate earnings by buyer
        const buyerEarnings = {};
        completedAuctions.forEach(auction => {
            if (auction.winner) {
                const buyerId = auction.winner.userId;
                const buyerName = auction.winner.username;
                
                if (!buyerEarnings[buyerId]) {
                    buyerEarnings[buyerId] = {
                        buyerName: buyerName,
                        totalSpent: 0
                    };
                }
                
                buyerEarnings[buyerId].totalSpent += auction.winner.bidAmount;
            }
        });
        
        const buyerEarningsElement = document.getElementById('buyerEarnings');
        buyerEarningsElement.innerHTML = '';
        
        Object.entries(buyerEarnings).forEach(([buyerId, data]) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${data.buyerName}: $${data.totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            buyerEarningsElement.appendChild(listItem);
        });

        // 4. Calculate top buyers (sorted by total spent)
        const topBuyersArray = Object.values(buyerEarnings).sort((a, b) => b.totalSpent - a.totalSpent);
        
        const topBuyersElement = document.getElementById('topBuyers');
        topBuyersElement.innerHTML = '';
        
        topBuyersArray.forEach(buyer => {
            const listItem = document.createElement('li');
            listItem.textContent = `${buyer.buyerName}: $${buyer.totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            topBuyersElement.appendChild(listItem);
        });

        // 5. Calculate best selling items (sorted by winning bid amount)
        const topItemsArray = [...completedAuctions].filter(auction => auction.winner).sort((a, b) => 
            b.winner.bidAmount - a.winner.bidAmount
        );
        
        const topItemsElement = document.getElementById('topItems');
        topItemsElement.innerHTML = '';
        
        topItemsArray.forEach(auction => {
            const listItem = document.createElement('li');
            listItem.textContent = `${auction.item_name}: $${auction.winner.bidAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            topItemsElement.appendChild(listItem);
        });
        
        // Handle empty sections
        if (completedAuctions.length === 0) {
            const emptyMessage = '<li>No completed auctions with winning bids found</li>';
            itemEarningsElement.innerHTML = emptyMessage;
            topItemsElement.innerHTML = emptyMessage;
        }
        
        if (Object.keys(buyerEarnings).length === 0) {
            const emptyMessage = '<li>No buyers found</li>';
            buyerEarningsElement.innerHTML = emptyMessage;
            topBuyersElement.innerHTML = emptyMessage;
        }
    }

    // Initial fetch
    fetchAuctionData();
    
    // Refresh data every 5 minutes
    setInterval(fetchAuctionData, 5 * 60 * 1000);
});