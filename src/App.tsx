import React, { useState } from "react";
import { useEffect } from "react";
import Login from "./components/Login";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import PatientRegistration from "./components/PatientRegistration/PatientRegistration";
import PatientsData from "./components/Patients/PatientsData";
import PatientForm from "./components/Patients/PatientForm";
import SelectPatient from "./components/PatientRegistration/SelectPatient";
import CreateRegistration from "./components/PatientRegistration/CreateRegistration";
import EditRegistration from "./components/PatientRegistration/EditRegistration";
import PatientDetailView from "./components/PatientRegistration/PatientDetailView";
import SDMData from "./components/SDM/SDMData";
import Notification from "./components/Notification";
import { User, Patient, Registration } from "./types";
import { patientService } from "./services/patientService";

function App() {
  // Inisialisasi state user dengan data dari localStorage
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeMenu, setActiveMenu] = useState("pendaftaran-pasien");
  const [currentView, setCurrentView] = useState<
    | "dashboard"
    | "pendaftaran-pasien"
    | "pasien"
    | "sdm"
    | "new-patient"
    | "select-patient"
    | "create-registration"
    | "edit-patient"
    | "edit-registration"
    | "patient-detail"
    | "patient-detail-from-data"
  >("pendaftaran-pasien");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  // Update handleLogout untuk menghapus data dari localStorage
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setCurrentView("pendaftaran-pasien");
  };

  // Verifikasi token saat aplikasi dimuat
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          const response = await fetch("http://localhost:3001/verify-token", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            // Token tidak valid, hapus dari localStorage
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            setUser(null);
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          // Jika ada error, tetap gunakan data dari localStorage
          // tapi user bisa logout manual jika diperlukan
        }
      }
    };

    verifyToken();
  }, []);

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    setCurrentView(menu as any);
  };

  const handleNavigateToPatients = () => {
    setCurrentView("pasien");
    setActiveMenu("pasien");
  };

  const handleNavigateToNewPatient = () => {
    setCurrentView("new-patient");
    setActiveMenu("pasien");
  };

  const handleNavigateToSelectPatient = () => {
    setCurrentView("select-patient");
    setActiveMenu("pendaftaran-pasien");
  };

  const handleNavigateToCreateRegistration = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView("create-registration");
    setActiveMenu("pendaftaran-pasien");
  };

  const handleNavigateToEditRegistration = (
    patient: Patient,
    registration: Registration
  ) => {
    setSelectedPatient(patient);
    setSelectedRegistration(registration);
    setCurrentView("edit-registration");
    setActiveMenu("pendaftaran-pasien");
  };

  const handleNavigateToPatientDetail = (registration: Registration) => {
    setSelectedRegistration(registration);
    setCurrentView("patient-detail");
    setActiveMenu("pendaftaran-pasien");
  };

  const handleNavigateToEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView("edit-patient");
    setActiveMenu("pasien");
  };

  const handleNavigateToPatientDetailFromData = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView("patient-detail-from-data");
    setActiveMenu("pasien");
  };

  const handleNavigateToDashboard = () => {
    setCurrentView("pendaftaran-pasien");
    setActiveMenu("pendaftaran-pasien");
  };

  const handleAddPatient = async (patientData: Omit<Patient, "id">) => {
    try {
      const rekamMedik = await patientService.generateRekamMedik();
      const newPatient = await patientService.createPatient({
        ...patientData,
        rekamMedik,
      });
      setPatients((prev: Patient[]) => [...prev, newPatient as Patient]);
      showNotification("success", "Data pasien berhasil disimpan");
      setCurrentView("pasien");
      setActiveMenu("pasien");
    } catch (error) {
      console.error("Error adding patient:", error);
      showNotification("error", "Gagal menyimpan data pasien");
    }
  };

  const handleUpdatePatient = async (
    patientData: Omit<Patient, "id">,
    id?: string
  ) => {
    if (!id) {
      showNotification("error", "ID pasien tidak ditemukan");
      return;
    }
    try {
      const updatedPatient = await patientService.updatePatient(
        id,
        patientData
      );
      setPatients((prev) =>
        prev.map((p) => (p.id === id ? (updatedPatient as Patient) : p))
      );
      showNotification("success", "Data pasien berhasil diperbarui");
      setCurrentView("pasien");
      setActiveMenu("pasien");
      setSelectedPatient(null);
    } catch (error) {
      console.error("Error updating patient:", error);
      showNotification("error", "Gagal memperbarui data pasien");
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Selamat datang di Sistem Klinik
            </p>
          </div>
        );
      case "pendaftaran-pasien":
        return (
          <PatientRegistration
            onNavigateToPatients={handleNavigateToPatients}
            onNavigateToNewPatient={handleNavigateToNewPatient}
            onNavigateToSelectPatient={handleNavigateToSelectPatient}
            onNavigateToEditRegistration={handleNavigateToEditRegistration}
            onNavigateToPatientDetail={handleNavigateToPatientDetail}
            onShowNotification={showNotification}
            user={user}
          />
        );
      case "select-patient":
        return (
          <SelectPatient
            onNavigateToDashboard={handleNavigateToDashboard}
            onNavigateToRegistration={() =>
              setCurrentView("pendaftaran-pasien")
            }
            onSelectPatient={handleNavigateToCreateRegistration}
            onShowNotification={showNotification}
          />
        );
      case "create-registration":
        return selectedPatient ? (
          <CreateRegistration
            patient={selectedPatient}
            onNavigateToDashboard={handleNavigateToDashboard}
            onNavigateToRegistration={() =>
              setCurrentView("pendaftaran-pasien")
            }
            onNavigateToSelectPatient={() => setCurrentView("select-patient")}
            onShowNotification={showNotification}
            onRegistrationComplete={() => setCurrentView("pendaftaran-pasien")}
          />
        ) : (
          <div className="p-6">
            <p className="text-red-600">Error: Pasien tidak ditemukan</p>
          </div>
        );
      case "edit-registration":
        return selectedPatient && selectedRegistration ? (
          <EditRegistration
            patient={selectedPatient}
            registration={selectedRegistration}
            onNavigateToDashboard={handleNavigateToDashboard}
            onNavigateToRegistration={() =>
              setCurrentView("pendaftaran-pasien")
            }
            onNavigateToSelectPatient={() => setCurrentView("select-patient")}
            onShowNotification={showNotification}
            onRegistrationComplete={() => setCurrentView("pendaftaran-pasien")}
          />
        ) : (
          <div className="p-6">
            <p className="text-red-600">
              Error: Pasien atau pendaftaran tidak ditemukan
            </p>
          </div>
        );
      case "pasien":
        return (
          <PatientsData
            onNavigateToDashboard={handleNavigateToDashboard}
            onNavigateToNewPatient={handleNavigateToNewPatient}
            onSelectPatient={handleNavigateToCreateRegistration}
            onEditPatient={handleNavigateToEditPatient}
            onViewPatientDetail={handleNavigateToPatientDetailFromData}
            onShowNotification={showNotification}
          />
        );
      case "new-patient":
        return (
          <PatientForm
            onSubmit={handleAddPatient}
            onCancel={() => setCurrentView("pasien")}
            onNavigateToDashboard={handleNavigateToDashboard}
            onNavigateToPatients={() => setCurrentView("pasien")}
          />
        );
      case "edit-patient":
        return selectedPatient ? (
          <PatientForm
            patient={selectedPatient}
            onSubmit={handleUpdatePatient}
            onCancel={() => setCurrentView("pasien")}
            onNavigateToDashboard={handleNavigateToDashboard}
            onNavigateToPatients={() => setCurrentView("pasien")}
          />
        ) : (
          <div className="p-6">
            <p className="text-red-600">Error: Pasien tidak ditemukan</p>
          </div>
        );
      case "patient-detail":
        return selectedRegistration ? (
          <PatientDetailView
            registration={selectedRegistration}
            onNavigateBack={() => setCurrentView("pendaftaran-pasien")}
            onShowNotification={showNotification}
          />
        ) : (
          <div className="p-6">
            <p className="text-red-600">
              Error: Data pendaftaran tidak ditemukan
            </p>
          </div>
        );
      case "patient-detail-from-data":
        return selectedPatient ? (
          <PatientDetailView
            patient={selectedPatient}
            onNavigateBack={() => setCurrentView("pasien")}
            onShowNotification={showNotification}
          />
        ) : (
          <div className="p-6">
            <p className="text-red-600">Error: Data pasien tidak ditemukan</p>
          </div>
        );
      case "sdm":
        return <SDMData />;
      default:
        return (
          <PatientRegistration
            onNavigateToPatients={handleNavigateToPatients}
            onNavigateToNewPatient={handleNavigateToNewPatient}
            onNavigateToSelectPatient={handleNavigateToSelectPatient}
            onNavigateToEditRegistration={handleNavigateToEditRegistration}
            onNavigateToPatientDetail={handleNavigateToPatientDetail}
            onShowNotification={showNotification}
            user={user}
          />
        );
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        onMenuClick={handleMenuClick}
        user={user}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default App;
