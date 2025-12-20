import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Products from "./pages/Products";
import PostProductChoice from "./pages/PostProductChoice";
import PostProduct from "./pages/PostProduct";
import PostRequest from "./pages/PostRequest";
import ProductDetail from "./pages/ProductDetail";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SubAdminDashboard from "./pages/admin/SubAdminDashboard";
import SubAdmins from "./pages/admin/SubAdmins";
import CreateSubAdmin from "./pages/admin/CreateSubAdmin";
import UserApprovals from "./pages/admin/UserApprovals";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminMessages from "./pages/admin/AdminMessages";
import SubAdminProducts from "./pages/admin/SubAdminProducts";
import SubAdminRequests from "./pages/admin/SubAdminRequests";
import SubAdminUserApprovals from "./pages/admin/SubAdminUserApprovals";
import SubAdminUsers from "./pages/admin/SubAdminUsers";
import { AdminRoute } from "./components/admin/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/products" element={<Products />} />
          <Route path="/post-product" element={<PostProduct />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute requiredRole="admin">
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/sub-admins" 
            element={
              <AdminRoute requiredRole="admin">
                <SubAdmins />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/sub-admins/create" 
            element={
              <AdminRoute requiredRole="admin">
                <CreateSubAdmin />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/user-approvals" 
            element={
              <AdminRoute requiredRole="admin">
                <UserApprovals />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <AdminRoute requiredRole="admin">
                <AdminUsers />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/products" 
            element={
              <AdminRoute requiredRole="admin">
                <AdminProducts />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/requests" 
            element={
              <AdminRoute requiredRole="admin">
                <AdminRequests />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/messages" 
            element={
              <AdminRoute requiredRole="admin">
                <AdminMessages />
              </AdminRoute>
            } 
          />
          <Route 
            path="/sub-admin/dashboard" 
            element={
              <AdminRoute requiredRole="sub-admin">
                <SubAdminDashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/sub-admin/user-approvals" 
            element={
              <AdminRoute requiredRole="sub-admin">
                <SubAdminUserApprovals />
              </AdminRoute>
            } 
          />
          <Route 
            path="/sub-admin/users" 
            element={
              <AdminRoute requiredRole="sub-admin">
                <SubAdminUsers />
              </AdminRoute>
            } 
          />
          <Route 
            path="/sub-admin/products" 
            element={
              <AdminRoute requiredRole="sub-admin">
                <SubAdminProducts />
              </AdminRoute>
            } 
          />
          <Route 
            path="/sub-admin/requests" 
            element={
              <AdminRoute requiredRole="sub-admin">
                <SubAdminRequests />
              </AdminRoute>
            } 
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
