function openModal() {
    document.getElementById('discountModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; 
}

function closeModal() {
    document.getElementById('discountModal').style.display = 'none';
    document.body.style.overflow = ''; 
}

function subscribe() {
    try {
        const emailInput = document.getElementById('email');
        const email = emailInput.value.trim();
        
        if (!validateEmail(email)) {
            showNotification('Please enter a valid email address.', 'error');
            emailInput.focus();
            return;
        }
        
        const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('subscribers', JSON.stringify(subscribers));
        }
        
        showNotification('Thank you! Check your email for a discount code.', 'success');
        closeModal();
        emailInput.value = ''; 
    } catch (error) {
        console.error('Subscription error:', error);
        showNotification('An error occurred. Please try again.', 'error');
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(itemName, itemPrice, itemId, itemImage) {
    try {
        const existingItem = cart.find(item => item.id === itemId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ 
                id: itemId,
                name: itemName, 
                price: parseFloat(itemPrice), 
                quantity: 1,
                image: itemImage || 'images/default-product.jpg'
            });
        }
        
        saveCart();
        showNotification(`${itemName} has been added to your cart.`, 'success');
        updateCartCounter();
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Could not add item to cart. Please try again.', 'error');
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCounter() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counterElements = document.querySelectorAll('.cart-counter, #cart-counter');
    
    counterElements.forEach(el => {
        el.textContent = count;
        el.setAttribute('aria-label', `${count} items in cart`);
    });
}

function removeItem(index) {
    if (index >= 0 && index < cart.length) {
        const removedItem = cart.splice(index, 1)[0];
        saveCart();
        showNotification(`${removedItem.name} removed from cart`, 'success');
        renderCart();
        updateCartCounter();
    }
}

function updateQuantity(index, action) {
    if (index >= 0 && index < cart.length) {
        if (action === 'increase') {
            cart[index].quantity += 1;
        } else if (action === 'decrease' && cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        }
        saveCart();
        renderCart();
        updateCartCounter();
    }
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartSummary = document.getElementById('cart-summary');

    if (!cartItemsContainer || !emptyCartMessage || !cartSummary) return;

    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartSummary.style.display = 'none';
    } else {
        emptyCartMessage.style.display = 'none';
        cartSummary.style.display = 'block';
        
        let html = '';
        cart.forEach((item, index) => {
            html += `
                <article class="cart-item" aria-labelledby="item-${index}">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}" loading="lazy" width="120" height="120">
                    </div>
                    <div class="cart-item-details">
                        <h3 id="item-${index}">${item.name}</h3>
                        <p class="price">ZMW ${item.price.toFixed(2)}</p>
                        <div class="quantity-controls">
                            <button class="quantity-btn" data-index="${index}" data-action="decrease" aria-label="Decrease quantity">
                                <i class="fas fa-minus" aria-hidden="true"></i>
                            </button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" data-index="${index}" data-action="increase" aria-label="Increase quantity">
                                <i class="fas fa-plus" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <button class="remove-btn" data-index="${index}" aria-label="Remove item">
                            <i class="fas fa-trash-alt" aria-hidden="true"></i>
                        </button>
                        <p class="item-total">ZMW ${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </article>
            `;
        });
        
        cartItemsContainer.innerHTML = html;
        
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', () => {
                removeItem(parseInt(button.getAttribute('data-index')));
            });
        });
        
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.getAttribute('data-index'));
                const action = button.getAttribute('data-action');
                updateQuantity(index, action);
            });
        });
        
        updateTotals();
    }
}

function updateTotals(discount = 0) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = 50;
    const discountedAmount = subtotal * discount;
    const total = (subtotal - discountedAmount) + delivery;

    document.getElementById('subtotal').textContent = `ZMW ${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `ZMW ${total.toFixed(2)}`;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.setAttribute('aria-live', 'polite');
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}" aria-hidden="true"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function setupEventListeners() {
   
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('discountModal');
        if (event.target === modal) {
            closeModal();
        }
    });
    
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const itemName = button.getAttribute('data-name');
            const itemPrice = button.getAttribute('data-price');
            const itemId = button.getAttribute('data-id');
            const itemImage = button.getAttribute('data-image');
            addToCart(itemName, itemPrice, itemId, itemImage);
        });
    });
    
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('Your cart is empty. Add items before checkout.', 'error');
            } else {
                window.location.href = 'checkout.html';
            }
        });
    }
}


document.addEventListener('DOMContentLoaded', function() {
   
    if (!localStorage.getItem('visited')) {
        setTimeout(openModal, 2000); 
        localStorage.setItem('visited', 'true');
    }
    
    renderCart();
    updateCartCounter();
    setupEventListeners();
});