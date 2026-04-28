import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Layout from "@/components/Layout";
import Login from "@/components/Login";
import PCCPage from "@/components/pcc/PCCPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <PCCPage /> },
      { path: "login", element: <Login /> },
    ],
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;
