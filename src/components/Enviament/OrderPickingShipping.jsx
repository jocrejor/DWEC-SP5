import { Routes, Route, Outlet } from "react-router-dom";
import Header from "../Header";
import OrderPickingShippingOrder from "./OrderPickingShippingOrder";
import OrderPickingShippingPicking from "./OrderPickingShippingPicking";

function OrderPickingShipping() {
  return (
    <>
      <Header title="Order Picking Shipping" />
      <Routes>
        <Route path="/ordes" element={<OrderPickingShippingOrder />} />
        <Route path="/picking" element={<OrderPickingShippingPicking />} />
        <Route path="/" element={<OrderPickingShippingOrder />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
      <Outlet />
    </>
  );
}

function Error404() {
  return (
    <div>
      <h2>ERROR 404</h2>
    </div>
  );
}

export default OrderPickingShipping;
