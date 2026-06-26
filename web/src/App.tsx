import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/LoginRegister/Login';
import { Signup } from './pages/LoginRegister/Signup';
import { ForgotPassword } from './pages/LoginRegister/ForgotPassword';
import { InvoicesList } from './pages/Invoices';
import { NewInvoice, EditInvoice } from './pages/Invoices/Form';
import { Clients, NewClient } from './pages/Clients';

import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route element={<Layout />}>
            <Route path="/" element={<InvoicesList />} />
            <Route path="/invoices/new" element={<NewInvoice />} />
            <Route path="/invoices/:id/edit" element={<EditInvoice />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/new" element={<NewClient />} />
          </Route>
        </Routes>
      </div>

      <Toaster position="bottom-center" />
    </div>
  );
}

export default App;
