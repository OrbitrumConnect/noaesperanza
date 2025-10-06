import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Payment from "./pages/Payment";
import AnalisarPrato from "./pages/AnalisarPrato";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const App = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/analisar-prato" element={<AnalisarPrato />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;
