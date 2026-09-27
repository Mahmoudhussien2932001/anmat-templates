import Header from "./components/Header";
import FeedbackForm from "./components/FeedbackForm";

export default function App() {
  return (
    <div className="page">
      <Header />
      <main className="shell page__main">
        <FeedbackForm />
      </main>
    </div>
  );
}
