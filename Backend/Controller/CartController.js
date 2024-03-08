//CRUD cart controller 
const Cart = require('../Model/cart');

//Create new cart 
const createCart = async (req, res) => {
    const { items, total } = req.body;

    //Validate user input
    if (!items) {
        return res.status(400).json({ error: 'Items are required' });
    }

    //Check if items is an array
    if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Items must be an array' });
    }

    //Validate individual items
    for (const item of items) {
        //Check if item is an object
        if (typeof item !== 'object') {
            return res.status(400).json({ error: 'Item must be an object' });
        }

        //Check if item has product and quantity properties
        const { product, quantity } = item;
        if (!product || !quantity) {
            return res.status(400).json({ error: 'Item must have product and quantity properties' });
        }

        //Check if product is valid
        if (!mongoose.Types.ObjectId.isValid(product)) {
            return res.status(400).json({ error: 'Item product is not a valid ObjectId' });
        }

        //Check if quantity is a number
        if (typeof quantity !== 'number') {
            return res.status(400).json({ error: 'Item quantity must be a number' });
        }

        //Check if quantity is greater than 0
        if (quantity <= 0) {
            return res.status(400).json({ error: 'Item quantity must be greater than 0' });
        }
    }

    //Check if total is a number
    if (typeof total !== 'number') {
        return res.status(400).json({ error: 'Total must be a number' });
    }

    //Create new cart
    const cart = new Cart({
        user: req.user._id,
        items,
        total
    });

    try {
        const newCart = await cart.save();
        res.status(201).json(newCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create cart' });
    }
};


//Get all cart
const getAllCarts = async (req, res) => {
    try {
        const carts = await Cart.find().populate('user', 'name email').exec(); 

        if (carts.length === 0) {
            return res.status(404).json({ error: 'No carts found' });
        }

        res.status(200).json(carts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get carts' });
    }
};


//Get single cart
const getCart = async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const cart = await Cart.findById(cartId).populate('user', 'name email').populate('items.product', 'name price').exec();

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        //Calculate and set total price
        let total = 0;
        cart.items.forEach(item => {
            total += item.product.price * item.quantity;
        });
        cart.total = total;

        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get cart' });
    }
};


//Update cart
const updateCart = async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const cart = await Cart.findById(cartId);

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        //Check for product id in request body
        if (!req.body.productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        //Check if productId exist in cart items array
        const productIndex = cart.items.findIndex(item => item.product._id.toString() === req.body.productId);

        //If productId not found, add new item to cart
        if (productIndex < 0) {
            const product = await Product.findById(req.body.productId);

            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            cart.items.push({
                product: product._id,
                quantity: req.body.quantity ? Number(req.body.quantity) : 1
            });

        } else {
            //If productId exist, update quantity

            //Check if quantity exist in request body
            if (!req.body.quantity) {
                return res.status(400).json({ error: 'Quantity is required' });
            }

            cart.items[productIndex].quantity = Number(req.body.quantity);
        }

        //Calculate and set total price
        let total = 0;
        cart.items.forEach(item => {
            total += item.product.price * item.quantity;
        });
        cart.total = total;

        const updatedCart = await cart.save();

        res.status(200).json(updatedCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update cart' });
    }
};


//Delete cart
const deleteCart = async (req, res) => {
    try {
        const cartId = req.params.cartId;

        // Find cart by ID
        const cart = await Cart.findById(cartId);

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        // Check if cart is related with any user
        //If yes, delete cart items and user cart reference
        if (cart.user) {
            // Find items belongs to cart
            const items = await Item.find({ cart: cartId });

            //Delete items
            const deletedItems = await Item.deleteMany({ _id: { $in: items.map(item => item._id) } });

            //Remove cart reference from user
            const user = await User.findById(cart.user);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            user.cart = undefined;
            await user.save();
        }

        //Delete cart
        const deletedCart = await cart.remove();

        res.status(200).json({ message: 'Cart deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete cart' });
    }
};


module.exports = {
    createCart,
    getAllCarts,
    getCart,
    updateCart,
    deleteCart,
};