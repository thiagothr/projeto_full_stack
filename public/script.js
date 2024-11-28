const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");
const nameInput = document.getElementById("name-client");
const nameWarn = document.getElementById("name-warn");

let cart = [];

// Carregar menu do backend
fetch('http://localhost:3000/api/menu')
  .then(response => response.json())
  .then(data => {
    data.forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.classList.add('flex', 'gap-2');

      menuItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="w-28 h-28 rounded-md hover:scale-110 hover:-rotate-2 duration-300" />
        <div>
          <p class="font-bold">${item.name}</p>
          <p class="text-sm">${item.description}</p>
          <div class="flex items-center gap-2 justify-between mt-3">
            <p class="font-bold text-lg">R$ ${item.price.toFixed(2)}</p>
            <button class="bg-gray-900 px-5 rounded add-to-cart-btn" data-name="${item.name}" data-price="${item.price}">
              <i class="fa fa-cart-plus text-lg text-white"></i>
            </button>
          </div>
        </div>
      `;
      menu.appendChild(menuItem);
    });
  })
  .catch(err => console.error('Erro ao carregar o menu:', err));

// Abrir o modal do carrinho
cartBtn.addEventListener("click", function () {
  updateCartModal();
  cartModal.style.display = "flex";
});

// Fechar o modal quando clicar fora
cartModal.addEventListener("click", function (event) {
  if (event.target === cartModal) {
    cartModal.style.display = "none";
  }
});

// Fechar o modal quando clicar em "fechar"
closeModalBtn.addEventListener("click", function (event) {
  cartModal.style.display = "none";
});

// Pegar o evento ao clicar no carrinho e inserir nome e preço
menu.addEventListener("click", function (event) {
  let parentButton = event.target.closest(".add-to-cart-btn");

  if (parentButton) {
    const name = parentButton.getAttribute("data-name");
    const price = parseFloat(parentButton.getAttribute("data-price"));
    addToCart(name, price);
  }
});

// Função para adicionar no carrinho
function addToCart(name, price) {
  const existingItem = cart.find(item => item.name === name);

  if (existingItem) {
    // Se existir o item, aumentará a quantidade apenas
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      price,
      quantity: 1,
    });
  }

  updateCartModal();
}

// Atualizar carrinho
function updateCartModal() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");
    cartItemElement.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium">${item.name}</p>
          <p>Qtd: ${item.quantity}</p>
          <p class="font-medium mt-2">${item.price.toFixed(2)}</p>
        </div>
        <div>
          <button class="text-red-500 hover:text-red-700 remove-from-cart-btn" data-name="${item.name}">
           Remover  
          </button> 
        </div>
      </div>  
    `;
    total += item.price * item.quantity;
    cartItemsContainer.appendChild(cartItemElement);
  });

  cartTotal.textContent = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  cartCounter.innerHTML = cart.length;
}

// Remover item do carrinho
cartItemsContainer.addEventListener("click", function (event) {
  if (event.target.classList.contains("remove-from-cart-btn")) {
    const name = event.target.getAttribute("data-name");
    removeItemCart(name);
  }
});

function removeItemCart(name) {
  const index = cart.findIndex(item => item.name === name);

  if (index !== -1) {
    const item = cart[index];

    if (item.quantity > 1) {
      item.quantity -= 1;
      updateCartModal();
      return;
    }

    cart.splice(index, 1);
    updateCartModal();
  }
}

// Salvar endereço
function validateAddress() {
  const inputValue = addressInput.value.trim();

  if (inputValue === "") {
    addressWarn.classList.remove("hidden");
    addressInput.classList.add("border-red-500");
    return false;
  } else {
    addressWarn.classList.add("hidden");
    addressInput.classList.remove("border-red-500");
    return true;
  }
}

// Salvar o nome
function validateName() {
  const inputName = nameInput.value.trim();

  if (inputName === "") {
    nameWarn.classList.remove("hidden");
    nameInput.classList.add("border-red-500");
    return false;
  } else {
    nameWarn.classList.add("hidden");
    nameInput.classList.remove("border-red-500");
    return true;
  }
}

// Finalizar o pedido
checkoutBtn.addEventListener("click", function () {
  if (cart.length === 0) return;

  // Validação do campo de endereço e nome
  const isAddressValid = validateAddress();
  const isNameValid = validateName();

  // Se qualquer validação falhar, o envio é interrompido
  if (!isAddressValid || !isNameValid) return;

  // Enviar o pedido para API WhatsApp
  const cartItems = cart.map((item) => {
    return `(${item.quantity}) ${item.name} R$ ${item.price.toFixed(2)} | `;
  }).join(" | ");
  
  // Monta a mensagem para o WhatsApp
  const message = encodeURIComponent(`Olá, gostaria de fazer o pedido: ${cartItems}`);
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Número de telefone do restaurante (substituir ao fazer commit)
  const phone = "21971819793";

  // Abre o WhatsApp com os dados do pedido
  window.open(`https://wa.me/${phone}?text=${message}%0A
    Endereço: ${encodeURIComponent(addressInput.value)}%0A
    Nome: ${encodeURIComponent(nameInput.value)}%0A
    Total: R$ ${total.toFixed(2)}`, "_blank");

  // Limpa o carrinho e atualiza a interface
  cart.length = 0;
  updateCartModal();

  // Limpa os campos de nome e endereço
  nameInput.value = "";
  addressInput.value = "";
});

// Verificar a hora e manipular o card horário
function checkRestaurantOpen() {
  const data = new Date();
  const hora = data.getHours();
  const minutos = data.getMinutes();
  return (hora >= 18 && (hora < 23 || (hora === 23 && minutos <= 59)));
}

const spanItem = document.getElementById("date-span");
const isOpen = checkRestaurantOpen(); // verifica se é true (se restaurante está aberto na hora certa)

if (isOpen) {
  spanItem.classList.remove("bg-red-500");
  spanItem.classList.add("bg-green-500");
} else {
  spanItem.classList.remove("bg-green-500");
  spanItem.classList.add("bg-red-500");
}
