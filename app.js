angular.module('shopApp', [])
.controller('MainCtrl', ['$scope', function($scope) {
  var storageKey = 'shopData';

  $scope.defaultProducts = [
    {id: 1, name: 'Classic Tee', price: 20, desc: 'Comfortable cotton tee for everyday wear.'},
    {id: 2, name: 'Stylish Mug', price: 12, desc: 'Ceramic mug with a modern design.'},
    {id: 3, name: 'Notebook', price: 8, desc: 'Pocket notebook for notes and ideas.'},
    {id: 4, name: 'Reusable Bag', price: 15, desc: 'Lightweight bag for shopping and travel.'}
  ];

  function loadData() {
    var saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Invalid shopData in storage:', e);
      }
    }
    return {
      products: angular.copy($scope.defaultProducts),
      cart: [],
      user: { role: 'guest', name: '', email: '' }
    };
  }

  function saveData() {
    localStorage.setItem(storageKey, JSON.stringify($scope.data));
  }

  $scope.data = loadData();
  $scope.products = $scope.data.products;
  $scope.cart = $scope.data.cart;
  $scope.user = $scope.data.user;

  $scope.cartCount = function() {
    var total = 0;
    for (var i = 0; i < $scope.cart.length; i++) {
      total += $scope.cart[i].qty;
    }
    return total;
  };

  $scope.isOfficial = function() {
    return $scope.user.role === 'official';
  };

  $scope.isUser = function() {
    return $scope.user.role === 'user';
  };

  $scope.addToCart = function(product) {
    if (!$scope.isUser()) {
      $scope.message = 'Please login as a user to add items to the cart.';
      return;
    }
    var existing = null;
    for (var i = 0; i < $scope.cart.length; i++) {
      if ($scope.cart[i].id === product.id) {
        existing = $scope.cart[i];
        break;
      }
    }
    if (existing) {
      existing.qty += 1;
    } else {
      $scope.cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
    }
    $scope.data.cart = $scope.cart;
    saveData();
    $scope.message = product.name + ' added to cart.';
  };

  $scope.removeItem = function(item) {
    var newCart = [];
    for (var i = 0; i < $scope.cart.length; i++) {
      if ($scope.cart[i].id !== item.id) {
        newCart.push($scope.cart[i]);
      }
    }
    $scope.cart = newCart;
    $scope.data.cart = $scope.cart;
    saveData();
  };

  $scope.clearCart = function() {
    $scope.cart = [];
    $scope.data.cart = $scope.cart;
    saveData();
  };

  $scope.total = function() {
    var sum = 0;
    for (var i = 0; i < $scope.cart.length; i++) {
      sum += $scope.cart[i].price * $scope.cart[i].qty;
    }
    return sum;
  };

  $scope.order = { name: '', email: '', address: '' };
  $scope.orderMessage = '';

  $scope.submitOrder = function() {
    if (!$scope.isUser()) {
      $scope.orderMessage = 'You must login as a user before placing an order.';
      return;
    }
    if (!$scope.order.name || !$scope.order.email || !$scope.order.address) {
      $scope.orderMessage = 'Please complete all fields.';
      return;
    }
    if ($scope.cart.length === 0) {
      $scope.orderMessage = 'Your cart is empty.';
      return;
    }
    $scope.orderMessage = 'Thank you, ' + $scope.order.name + '! Your order has been placed.';
    $scope.clearCart();
    $scope.order = { name: '', email: '', address: '' };
  };

  $scope.loginAttempt = { role: 'user', name: '', email: '' };
  $scope.loginMessage = '';
  $scope.productMessage = '';
  $scope.newProduct = { name: '', desc: '', price: null };

  $scope.login = function() {
    if (!$scope.loginAttempt.name || !$scope.loginAttempt.email) {
      $scope.loginMessage = 'Please enter name and email to login.';
      return;
    }
    $scope.user = {
      role: $scope.loginAttempt.role,
      name: $scope.loginAttempt.name,
      email: $scope.loginAttempt.email
    };
    $scope.data.user = $scope.user;
    saveData();
    $scope.loginMessage = 'Logged in as ' + $scope.user.role + ' (' + $scope.user.name + ').';
  };

  $scope.logout = function() {
    $scope.user = { role: 'guest', name: '', email: '' };
    $scope.loginMessage = 'You have been logged out.';
    $scope.data.user = $scope.user;
    saveData();
  };

  $scope.addProduct = function() {
    if (!$scope.isOfficial()) {
      $scope.productMessage = 'Only officials can add new products.';
      return;
    }
    if (!$scope.newProduct.name || !$scope.newProduct.desc || !$scope.newProduct.price) {
      $scope.productMessage = 'Please enter name, description, and price for the product.';
      return;
    }
    var nextId = 1;
    for (var i = 0; i < $scope.products.length; i++) {
      if ($scope.products[i].id >= nextId) {
        nextId = $scope.products[i].id + 1;
      }
    }
    $scope.products.push({
      id: nextId,
      name: $scope.newProduct.name,
      desc: $scope.newProduct.desc,
      price: Number($scope.newProduct.price)
    });
    $scope.data.products = $scope.products;
    saveData();
    $scope.productMessage = 'Product added successfully.';
    $scope.newProduct = { name: '', desc: '', price: null };
  };
}]);
