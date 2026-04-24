import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Layout from "@/components/Layout";
import StringeeClient from "@/components/stringee/StringeeClient";
import AdminPage from "@/components/admin/AdminPage";
import PCCPage from "./components/pcc/PCCPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <StringeeClient /> },
      { path: "admin", element: <AdminPage /> },
      { path: "pcc", element: <PCCPage /> },
    ],
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;
