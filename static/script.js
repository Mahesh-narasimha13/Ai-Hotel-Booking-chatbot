document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatContainer = document.getElementById('chat-container');
    const typingIndicator = document.getElementById('typing-indicator');
    const budgetFilter = document.getElementById('budget-filter');
    const budgetValue = document.getElementById('budget-value');
    const quickReplies = document.querySelectorAll('.quick-reply');
    const ratingRadios = document.querySelectorAll('input[name="rating"]');
    const amenityCheckboxes = document.querySelectorAll('.amenity-filter');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const navLinks = document.querySelectorAll('.nav-link');
    const phoneBtn = document.getElementById('phone-btn');
    const menuBtn = document.getElementById('menu-btn');
    const leftPanel = document.getElementById('left-panel');
    const smartFilters = document.querySelectorAll('.smart-filter');

    // Update budget display
    budgetFilter.addEventListener('input', (e) => {
        budgetValue.textContent = `$${e.target.value}`;
    });

    // Handle Quick Replies
    quickReplies.forEach(btn => {
        btn.addEventListener('click', () => {
            chatInput.value = btn.textContent;
            chatForm.dispatchEvent(new Event('submit'));
        });
    });

    // Handle Reset Filters
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            budgetFilter.value = 500;
            budgetValue.textContent = '$500';
            ratingRadios.forEach(r => { if(r.value === 'any') r.checked = true; });
            amenityCheckboxes.forEach(cb => cb.checked = false);
            smartFilters.forEach(f => {
                f.classList.remove('bg-indigo-500', 'text-white', 'border-indigo-400');
                f.classList.add('bg-white/10', 'border-white/5');
            });
        });
    }

    // Handle Nav Links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const prompt = link.getAttribute('data-prompt');
            if (prompt) {
                chatInput.value = prompt;
                chatForm.dispatchEvent(new Event('submit'));
                if (leftPanel && !leftPanel.classList.contains('hidden') && window.innerWidth < 768) {
                    leftPanel.classList.add('hidden');
                }
            }
        });
    });

    // Handle Phone and Menu Buttons
    if (phoneBtn) {
        phoneBtn.addEventListener('click', () => {
            chatInput.value = "I need to contact customer support.";
            chatForm.dispatchEvent(new Event('submit'));
        });
    }

    if (menuBtn && leftPanel) {
        menuBtn.addEventListener('click', () => {
            leftPanel.classList.toggle('hidden');
        });
    }

    // Handle Smart Filters
    smartFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            const isActive = filter.classList.contains('bg-indigo-500');
            if (isActive) {
                filter.classList.remove('bg-indigo-500', 'text-white', 'border-indigo-400');
                filter.classList.add('bg-white/10', 'border-white/5');
            } else {
                filter.classList.remove('bg-white/10', 'border-white/5');
                filter.classList.add('bg-indigo-500', 'text-white', 'border-indigo-400');
            }
        });
    });

    // Handle Book Now Buttons (Event Delegation)
    chatContainer.addEventListener('click', (e) => {
        const bookBtn = e.target.closest('.book-now-btn');
        if (bookBtn) {
            const hotelName = bookBtn.getAttribute('data-hotel');
            if (hotelName) {
                chatInput.value = `I want to book ${hotelName}`;
                chatForm.dispatchEvent(new Event('submit'));
            }
        }
    });

    function getActiveFilters() {
        const activeSmartFilters = Array.from(smartFilters)
            .filter(f => f.classList.contains('bg-indigo-500'))
            .map(f => f.getAttribute('data-value'));

        const filters = {
            budget: budgetFilter.value,
            rating: document.querySelector('input[name="rating"]:checked').value,
            amenities: Array.from(amenityCheckboxes).filter(cb => cb.checked).map(cb => cb.value),
            smart: activeSmartFilters
        };
        return filters;
    }

    function appendUserMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'flex gap-3 justify-end mt-2 mb-2';
        msgDiv.innerHTML = `
            <div class="msg-bubble msg-user shadow-md">
                <p>${text}</p>
            </div>
            <img src="https://ui-avatars.com/api/?name=User&background=cbd5e1&color=333" alt="User" class="w-8 h-8 rounded-full shadow-sm mt-1">
        `;
        chatContainer.appendChild(msgDiv);
        scrollToBottom();
    }

    function appendBotMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'flex gap-3 mt-2 mb-2';
        msgDiv.innerHTML = `
            <img src="https://ui-avatars.com/api/?name=AI&background=6366f1&color=fff" alt="AI" class="w-8 h-8 rounded-full shadow-sm mt-1">
            <div class="msg-bubble msg-bot shadow-md">
                <p>${text}</p>
            </div>
        `;
        chatContainer.appendChild(msgDiv);
        scrollToBottom();
    }

    function appendHotelCards(hotels) {
        if (!hotels || hotels.length === 0) return;

        const containerDiv = document.createElement('div');
        containerDiv.className = 'flex gap-3 mt-2 mb-4 w-full';
        
        let cardsHTML = `
            <img src="https://ui-avatars.com/api/?name=AI&background=6366f1&color=fff" alt="AI" class="w-8 h-8 rounded-full shadow-sm mt-1 opacity-0">
            <div class="flex flex-col gap-4 w-full max-w-[85%]">
        `;

        hotels.forEach(hotel => {
            const amenitiesHTML = hotel.amenities.map(a => `<span class="px-2 py-0.5 bg-white/10 rounded-full text-[10px] border border-white/5">${a}</span>`).join('');
            
            cardsHTML += `
                <div class="hotel-card bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-lg">
                    <div class="h-32 md:h-auto md:w-2/5 overflow-hidden">
                        <img src="${hotel.image}" alt="${hotel.name}" class="w-full h-full object-cover">
                    </div>
                    <div class="p-4 flex-1 flex flex-col justify-between">
                        <div>
                            <div class="flex justify-between items-start mb-1">
                                <h3 class="font-semibold text-white leading-tight">${hotel.name}</h3>
                                <div class="bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                    <i class="fa-solid fa-star text-[10px]"></i> ${hotel.rating}
                                </div>
                            </div>
                            <p class="text-xs text-slate-400 mb-2"><i class="fa-solid fa-location-dot mr-1"></i>${hotel.location}</p>
                            <div class="flex flex-wrap gap-1 mb-3">
                                ${amenitiesHTML}
                            </div>
                        </div>
                        <div class="flex items-end justify-between mt-auto">
                            <div>
                                <span class="text-xs text-slate-400 block">Starting from</span>
                                <span class="text-lg font-bold text-indigo-300">${hotel.price}<span class="text-xs font-normal text-slate-400">/night</span></span>
                            </div>
                            <button class="book-now-btn bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white text-xs font-semibold py-2 px-4 rounded-xl transition shadow-md" data-hotel="${hotel.name}">
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        cardsHTML += `</div>`;
        containerDiv.innerHTML = cardsHTML;
        chatContainer.appendChild(containerDiv);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        // UI Updates
        appendUserMessage(message);
        chatInput.value = '';
        typingIndicator.classList.remove('hidden');
        scrollToBottom();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    filters: getActiveFilters()
                })
            });

            const data = await response.json();
            
            // Hide typing indicator
            typingIndicator.classList.add('hidden');
            
            if (data.reply) {
                appendBotMessage(data.reply);
            }
            
            if (data.hotels && data.hotels.length > 0) {
                appendHotelCards(data.hotels);
            }

        } catch (error) {
            console.error('Error:', error);
            typingIndicator.classList.add('hidden');
            appendBotMessage("Sorry, I'm having trouble connecting to the server right now.");
        }
    });
});
