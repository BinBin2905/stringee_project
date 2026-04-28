import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Layout from "@/components/Layout";
import Login from "@/components/Login";
import PCCPage from "@/components/pcc/PCCPage";
import SoftphonePage from "@/components/softphone/SoftphonePage";
import Toaster from "@/components/Toaster";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <PCCPage /> },
      { path: "login", element: <Login /> },
    ],
  },
  {
    path: "/softphone",
    element: (
      <div className="min-h-screen bg-base-200 text-base-content">
        <SoftphonePage />
        <Toaster />
      </div>
    ),
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;
