import { useState} from "react";
import { Routes,Route,Outlet } from "react-router-dom";
import Header from "../Header";
import OrderPickingReceptionOrder from "./OrderPickingReceptionOrder";
import OrderPickingReceptionPicking from "./OrderPickingReceptionPicking";


function OrderPickingReception() {


    return (
        <> 
            <Header title="Order picking Reception" />
            <Routes>       
                <Route path="/ordes" element={<OrderPickingReceptionOrder />} />
                <Route path="/picking" element={<OrderPickingReceptionPicking />} />
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

export default OrderPickingReception;
