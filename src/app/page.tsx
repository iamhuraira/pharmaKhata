import LandingPage from "@/components/landing-page/LandingPage";

export async function generateMetadata() {
  return {
    title: "Pharma Khata - Streamline Your Clinic Visits with Digital Ordering",
    description: "Transform your field sales operations with Pharma Khata. Seamless order collection, real-time tracking, and automated inventory management for pharmaceutical companies.",
  };
}

export default function Index() {
  return <LandingPage />;
}
