export default function FormError({ error }) {
  if (!error) {
    return null;
  }

  return (
    <div className="form-error" role="alert">
      <p>{error.message}</p>

      {error.details?.length > 0 && (
        <ul>
          {error.details.map((detail, index) => (
            <li key={index}>
              {detail.field}: {detail.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
