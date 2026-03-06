import { createBrowserRouter } from "react-router-dom";
import { Root } from "./components/Root";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { AnalyzerDashboard } from "./components/AnalyzerDashboard";
import { UserDashboard } from "./components/UserDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { About } from "./components/About";
import Pipeline from "./components/Pipeline";
import Layout from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Login },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      {
        element: <Layout />,
        children: [
          {
            path: "analyzer",
            element: (
              <ProtectedRoute>
                <AnalyzerDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: "dashboard",
            element: (
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: "pipeline",
            element: (
              <ProtectedRoute>
                <Pipeline />
              </ProtectedRoute>
            ),
          },
          { path: "about", element: <About /> },
        ],
      },
    ],
  },
]);
