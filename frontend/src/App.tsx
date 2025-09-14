// дава възможност за навигация в приложението
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// предоставя информация за автентикацията
import {AuthProvider, UserRole} from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
// Автентикация
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import {JSX} from "react";
// Публични страници
import Home from './pages/Home';
// Треньорски страници
import TrainerDashboard from './pages/trainer/TrainerDashboard.tsx';
import TrainerSchedule from './pages/trainer/Schedule';
import TrainerProfile from './pages/trainer/Profile';
// Клиентски страници
import ClientBookings from './pages/client/Bookings';
import ClientBook from './pages/client/Book';
import Profile from './pages/client/Profile';

// защитава маршрутите изискващи автентикация
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles?: UserRole[] }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return <div>Зареждане...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Редирект според ролята
        if (user.role === UserRole.TRAINER) {
            return <Navigate to="/trainer/dashboard" />;
        } else {
            return <Navigate to="/client/bookings" />;
        }
    }

    return children;
};

// съдържа всички маршрути в приложението
function AppRoutes() {
    return (
        <Routes>
            {/* Публични пътища */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Треньорски пътища */}
            <Route
                path="/trainer/dashboard"
                element={// кой компонент да се рендерира, ако потребителят е треньор
                    <ProtectedRoute allowedRoles={[UserRole.TRAINER]}>
                        <TrainerDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/trainer/schedule"
                element={
                    <ProtectedRoute allowedRoles={[UserRole.TRAINER]}>
                        <TrainerSchedule />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/trainer/profile"
                element={
                    <ProtectedRoute allowedRoles={[UserRole.TRAINER]}>
                        <TrainerProfile />
                    </ProtectedRoute>
                }
            />

            {/* Клиентски пътища */}
            <Route
                path="/client/bookings"
                element={
                    <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
                        <ClientBookings />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/client/book"
                element={
                    <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
                        <ClientBook />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/client/profile"
                element={
                    <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
                        <Profile />
                    </ProtectedRoute>
                }
            />

            {/* Път по подразбиране */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;