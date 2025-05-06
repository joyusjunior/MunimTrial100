// Simple frontend with localStorage for demo purposes
document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const chatView = document.getElementById('chat-view');
    const authMessage = document.getElementById('auth-message');
    const currentUserSpan = document.getElementById('current-user');
    
    // Demo users database in localStorage
    if (!localStorage.getItem('accountingUsers')) {
        localStorage.setItem('accountingUsers', JSON.stringify({
            'admin': { password: 'admin123', transactions: [] }
        }));
    }
    
    // Login/Register logic
    document.getElementById('login-btn').addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const users = JSON.parse(localStorage.getItem('accountingUsers'));
        
        if (users[username] && users[username].password === password) {
            // Successful login
            currentUserSpan.textContent = username;
            loginView.classList.add('d-none');
            chatView.classList.remove('d-none');
            initializeChat(username);
        } else {
            authMessage.textContent = 'Invalid credentials';
        }
    });
    
    document.getElementById('register-btn').addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const users = JSON.parse(localStorage.getItem('accountingUsers'));
        
        if (users[username]) {
            authMessage.textContent = 'Username already exists';
        } else {
            users[username] = { password, transactions: [] };
            localStorage.setItem('accountingUsers', JSON.stringify(users));
            authMessage.textContent = 'Registration successful! Please login.';
            authMessage.style.color = 'green';
        }
    });
    
    function initializeChat(username) {
        const chatMessages = document.getElementById('chat-messages');
        const userInput = document.getElementById('user-input');
        const sendBtn = document.getElementById('send-btn');
        
        // Add welcome message
        addMessage('bot', 'Hello! I'm your accounting assistant. How can I help you today?');
        
        // Quick action buttons
        document.querySelectorAll('.quick-actions button').forEach(btn => {
            btn.addEventListener('click', () => {
                userInput.value = btn.dataset.command;
                sendBtn.click();
            });
        });
        
        // Send message handler
        sendBtn.addEventListener('click', () => {
            const message = userInput.value.trim();
            if (message) {
                addMessage('user', message);
                userInput.value = '';
                
                // Process accounting commands
                setTimeout(() => processCommand(message, username), 500);
            }
        });
        
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendBtn.click();
        });
    }
    
    function processCommand(command, username) {
        const users = JSON.parse(localStorage.getItem('accountingUsers'));
        const user = users[username];
        
        if (command.startsWith('/invoice')) {
            // Demo invoice creation
            const invoice = {
                type: 'invoice',
                amount: 1000,
                date: new Date().toISOString(),
                invoiceNumber: `INV-${Date.now()}`,
                items: [{ description: 'Consulting', quantity: 1, rate: 1000 }]
            };
            
            user.transactions.push(invoice);
            localStorage.setItem('accountingUsers', JSON.stringify(users));
            
            addMessage('bot', `Created invoice ${invoice.invoiceNumber} for ₹${invoice.amount}`);
            addMessage('bot', `<a href="#" onclick="downloadPDF('${JSON.stringify(invoice)}')">Download PDF</a>`);
        }
        else if (command.startsWith('/expense')) {
            // Demo expense recording
            const expense = {
                type: 'expense',
                amount: 500,
                date: new Date().toISOString(),
                description: 'Office supplies'
            };
            
            user.transactions.push(expense);
            localStorage.setItem('accountingUsers', JSON.stringify(users));
            
            addMessage('bot', `Recorded expense: ${expense.description} - ₹${expense.amount}`);
        }
        else if (command.startsWith('/ledger')) {
            // Show ledger
            if (user.transactions.length === 0) {
                addMessage('bot', 'No transactions found');
            } else {
                addMessage('bot', 'Your ledger:');
                user.transactions.forEach(txn => {
                    addMessage('bot', `${txn.type.toUpperCase()}: ${txn.description || ''} - ₹${txn.amount} (${new Date(txn.date).toLocaleDateString()})`);
                });
            }
        }
        else {
            addMessage('bot', 'I can help with: /invoice, /expense, /ledger');
        }
    }
    
    function addMessage(sender, text) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Make downloadPDF available globally
    window.downloadPDF = function(invoiceData) {
        const invoice = JSON.parse(invoiceData);
        const doc = new PDFDocument();
        const filename = `invoice_${invoice.invoiceNumber}.pdf`;
        
        // Create PDF download
        const blob = new Blob([doc], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };
});
