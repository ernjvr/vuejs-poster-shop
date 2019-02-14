var PRICE = 9.99;
var LOAD_NUM = 10;
new Vue({
    el: '#app',
    data: {
        total: 0,
        results: [],
        items: [],
        cart: [],
        newSearch: 'anime',
        lastSearch: '',
        loading: false,
        price: PRICE
    },
    methods: {
        appendItems: function() {
            if(this.items.length < this.results.length) {
                var append = this.results.slice(this.items.length, this.items.length + LOAD_NUM);
                this.items = this.items.concat(append);
            }
        },
        onSubmit: function() {
            if(this.newSearch.length) {
                this.items = [];
                this.loading = true;
                // make a call to the node js endpoint in index.js > which will make a call to imgur
                // view resource returns > promise > chain > then() > when promise resolves > trigger a callback function you provide
                this.$http.get('/search/'.concat(this.newSearch)).then(function(res) {
                    console.log(res.data);
                    this.lastSearch = this.newSearch;
                    this.results = res.data;
                    this.appendItems();
                    this.loading = false;
                });
            }
        },
        addItem: function(index) {
            var item = this.items[index];
            var found = false;
            for(var i = 0; i < this.cart.length; i++) {
                if(this.cart[i].id === item.id) {
                    this.cart[i].qty += 1;
                    found = true;
                    break;
                }
            }

            if(!found) {
                this.cart.push({
                    id: item.id,
                    title: item.title,
                    price: PRICE,
                    qty: 1
                });
            }
            this.total += PRICE;
        },
        inc: function(item) {
            item.qty++;
            this.total += item.price;
        },
        dec: function(item) {
            item.qty--;
            this.total -= item.price;

            if(!item.qty) {
                for(var i = 0; i < this.cart.length; i++) {
                    if(this.cart[i].id === item.id) {
                        this.cart.splice(i, 1);
                        break;
                    }
                }
            }
        }
    },
    filters: {
        currency: function(price) {
            return '$'.concat(price.toFixed(2));
        }
    },
    computed: {
        noMoreItems: function() {
            return this.items.length === this.results.length && this.results.length > 0;
        }
    },
    mounted: function() {
        this.onSubmit();
        // the vue instance this > is not in scope inside the enterViewport() function
        // assign the vuejs this to a local variable > to reference inside enterViewport() function
        var vueInstance = this;
        // pass in a DOM node reference into constructor
        var elem = document.getElementById('product-list-bottom');
        // watcher will trigger events > when enter or leave screen
        var watcher = scrollMonitor.create(elem);
        watcher.enterViewport(function() {
            // the vue instance this > is not in scope inside the enterViewport() function > 
            // because scrollMonitor => 3rd party library & not part of vuejs core library
            // this.appendItems();
            vueInstance.appendItems();
        });
    }
});