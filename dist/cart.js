"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const adminButton = document.getElementById("admin-button");
    const myform = document.querySelector(".hidden");
    const productForm = document.getElementById("product-form");
    const myproducts = document.getElementById("myproducts");
    const productTable = document.getElementById("product-table");
    const updateForm = document.getElementById("update-form");
    const cancelUpdateButton = document.getElementById("cancel-update");
    const cartItems = document.querySelector(".cartitems");
    if (!myform || !productForm || !myproducts || !productTable || !updateForm || !cancelUpdateButton || !cartItems) {
        console.error("One or more elements not found");
        return;
    }
    adminButton.addEventListener("click", () => {
        myform.classList.toggle("hidden");
    });
    productForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const productNameInput = document.getElementById("product-name");
        const productDateInput = document.getElementById("product-date");
        const productPriceInput = document.getElementById("product-price");
        const productImageInput = document.getElementById("product-image");
        const productName = productNameInput.value.trim();
        const productDate = productDateInput.value.trim();
        const productPrice = productPriceInput.value.trim();
        const productImage = productImageInput.value.trim();
        if (productName && productDate && productPrice && productImage) {
            const newProduct = {
                name: productName,
                date: productDate,
                price: productPrice,
                image: productImage,
            };
            fetch("http://localhost:3000/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newProduct),
            })
                .then(response => response.json())
                .then(() => {
                productNameInput.value = "";
                productPriceInput.value = "";
                productDateInput.value = "";
                productImageInput.value = "";
                fetchProducts();
            })
                .catch(error => console.error("Error:", error));
        }
        else {
            console.log("All fields are required.");
        }
    });
    let currentUpdateId = null;
    function fetchProducts() {
        fetch("http://localhost:3000/products")
            .then(response => response.json())
            .then((products) => {
            myproducts.innerHTML = "";
            productTable.innerHTML = "";
            products.forEach(product => {
                const productInfo = document.createElement("div");
                productInfo.innerHTML = `
                    <p>${product.name}</p>
                    <h3>Ksh ${product.price}</h3>
                    <p>${product.date}</p>
                    <img src="${product.image}" alt="${product.name}" width="100" height="100">
                    <button class="add-button" data-id="${product.id}">ADD</button>
                `;
                myproducts.appendChild(productInfo);
                const newRow = productTable.insertRow();
                newRow.innerHTML = `
                    <td>${product.name}</td>
                    <td>${product.price}</td>
                    <td>${product.date}</td>
                    <td><img src="${product.image}" alt="${product.name}" width="50" height="50"></td>
                    <td><button class="update-button" data-id="${product.id}">Update</button></td>
                    <td><button class="delete-button" data-id="${product.id}">Delete</button></td>
                `;
            });
            document.querySelectorAll(".delete-button").forEach(button => {
                button.addEventListener("click", event => {
                    const id = event.target.dataset.id;
                    if (id) {
                        deleteProduct(id);
                    }
                    else {
                        console.error("Product ID not found");
                    }
                });
            });
            document.querySelectorAll(".update-button").forEach(button => {
                button.addEventListener("click", event => {
                    const id = event.target.dataset.id;
                    if (id) {
                        currentUpdateId = id;
                        prepareUpdateForm(id);
                    }
                    else {
                        console.error("Product ID not found");
                    }
                });
            });
            document.querySelectorAll(".add-button").forEach(button => {
                button.addEventListener("click", event => {
                    const id = event.target.dataset.id;
                    if (id) {
                        addToCart(id);
                    }
                    else {
                        console.error("Product ID not found");
                    }
                });
            });
        })
            .catch(error => console.error("Error:", error));
    }
    function deleteProduct(id) {
        fetch(`http://localhost:3000/products/${id}`, {
            method: "DELETE",
        })
            .then(() => {
            fetchProducts();
        })
            .catch(error => console.error("Error:", error));
    }
    function prepareUpdateForm(id) {
        if (!updateForm) {
            console.error("Update form not found");
            return;
        }
        fetch(`http://localhost:3000/products/${id}`)
            .then(response => response.json())
            .then((product) => {
            const updateNameInput = document.getElementById("update-name");
            const updateDateInput = document.getElementById("update-date");
            const updatePriceInput = document.getElementById("update-price");
            const updateImageInput = document.getElementById("update-image");
            updateNameInput.value = product.name;
            updateDateInput.value = product.date;
            updatePriceInput.value = product.price;
            updateImageInput.value = product.image;
            updateForm.classList.remove("hidden");
        })
            .catch(error => console.error("Error:", error));
    }
    if (updateForm) {
        updateForm.addEventListener("submit", (event) => {
            event.preventDefault();
            if (currentUpdateId) {
                const productName = document.getElementById("update-name").value;
                const productDate = document.getElementById("update-date").value;
                const productPrice = document.getElementById("update-price").value;
                const productImage = document.getElementById("update-image").value;
                if (productName && productDate && productPrice && productImage) {
                    const updatedProduct = {
                        name: productName,
                        date: productDate,
                        price: productPrice,
                        image: productImage,
                    };
                    fetch(`http://localhost:3000/products/${currentUpdateId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(updatedProduct),
                    })
                        .then(() => {
                        updateForm.classList.add("hidden");
                        currentUpdateId = null;
                        fetchProducts();
                    })
                        .catch(error => console.error("Error:", error));
                }
                else {
                    console.log("All fields are required for update.");
                }
            }
        });
    }
    if (cancelUpdateButton) {
        cancelUpdateButton.addEventListener("click", () => {
            updateForm.classList.add("hidden");
            currentUpdateId = null;
        });
    }
    function addToCart(id) {
        fetch(`http://localhost:3000/products/${id}`)
            .then(response => response.json())
            .then((product) => {
            const cartItem = document.createElement("div");
            cartItem.innerHTML = `
                <p>${product.name}</p>
                <h3>Ksh ${product.price}</h3>
                <img src="${product.image}" alt="${product.name}" width="70" height="70">
                <button>BUY</button>
            `;
            cartItems.appendChild(cartItem);
        })
            .catch(error => console.error("Error:", error));
    }
    fetchProducts();
});
