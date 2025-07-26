import OrderForm from "@/components/OrderForm";

export async function generateMetadata() {
  return {
    title: "Home",
    description: "meta_description",
  };
}


export default function Index() {


  return <OrderForm />;
}
