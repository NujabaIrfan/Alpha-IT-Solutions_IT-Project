import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addOrder } from "../../redux/features/cart/cartSlice";
import axios from "axios";

const Summary = ({ cart }) => {
    // const customerId = localStorage.getItem("userId"); // or from Redux/auth state
    const navigate = useNavigate(); // React Router navigation
    const dispatch = useDispatch();

    // const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => {
        const price = item.discountPrice ?? item.price;
        return sum + price * item.quantity;
    }, 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

    const handleCheckout = async () => {
        try {
            if (!total || isNaN(total)) {
                alert("Invalid total amount!");
                return;
            }

            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const customerId = user._id || null;
            console.log("🧑‍💻 Logged-in customer ID (inside checkout):", customerId);

            if (!customerId) {
                alert("No customer ID found. Please log in again.");
                return;
            }

            const requiredLabels = ["Processor", "GPU", "RAM", "Storage", "Power Supply", "Casing"];

            const items = cart.map(item => {
                const rawSpecs = item.specs || [];
                const labels = rawSpecs.map(s => s.label?.trim()).filter(Boolean);
                const isPrebuild = requiredLabels.every(label => labels.includes(label));
              
                const base = {
                  itemId: item._id,
                  itemType: isPrebuild ? "prebuild" : "product",
                  quantity: item.quantity
                };
              
                return isPrebuild
                  ? {
                      ...base,
                      specs: rawSpecs.map(spec => ({
                        _id: spec.id,           // ✅ Include product ID
                        label: spec.label,
                        value: spec.value
                      }))
                    }
                  : base; // ❌ still exclude specs for non-prebuilds
              });
    
            const orderData = {
                customerId: customerId,
                totalAmount: total,
                status: "Pending",
                items: items
            };

            // Retrieve token from localStorage (or sessionStorage, or cookies)
            const token = localStorage.getItem("token");

            if (!token) {
                console.error("No token found! Please log in.");
                return;
            }

            const response = await axios.post("http://localhost:5000/api/successorders/create", orderData, {
                headers: {
                    Authorization: `Bearer ${token}` // Sending the token in the header
                }
            });
            console.log("SuccessOrder saved:", response.data);

            dispatch(addOrder());
            localStorage.removeItem("successOrder");
            localStorage.removeItem("orderPlaced");
            navigate("/CheckoutForm"); // Ensure this route exists and navigate to the checkout form
        } catch (error) {
            console.error("Error saving order:", error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-6">Order Summary</h3>
            <h3 className="text-lg font-semibold text-blue-400 mb-4">Estimate Shipping and Tax</h3>
            <p className="text-sm text-gray-400 mb-6">Enter your destination to get a shipping estimate.</p>

            <div className="space-y-2">
                <p className="text-gray-300">Subtotal: {formatCurrency(subtotal)}</p>
                <p className="text-gray-300">Tax (5%): {formatCurrency(tax)}</p>
                <p className="font-bold text-lg text-white">Total: {formatCurrency(total)}</p>
            </div>

            <button
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 mt-6 w-full"
                onClick={handleCheckout}
            >
                Proceed to Checkout
            </button>
        </div>
    );
};

export default Summary;
