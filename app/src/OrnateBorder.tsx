import "./OrnateBorder.css";

export const OrnateBorder = () => {
  return (
    <div className="ornate-border-container">
      <div className="ornate-border-row-a">
        <div className="ornate-border-col-a">
          <svg width="40" height="40">
            <path
              fill="none"
              stroke="#000000"
              strokeWidth="4"
              strokeLinejoin="miter"
              strokeMiterlimit="8.0"
              d="M2,40 L2,16 C11,34 11,11 11,11 C34,11 16,2 16,2 L40,2"
            />
          </svg>
        </div>
        <div className="ornate-border-col-b"></div>
        <div className="ornate-border-col-c">
          <svg width="40" height="40">
            <path
              fill="none"
              stroke="#000000"
              strokeWidth="4"
              strokeLinejoin="miter"
              strokeMiterlimit="8.0"
              transform="rotate(90,20,20)"
              d="M2,40 L2,16 C11,34 11,11 11,11 C34,11 16,2 16,2 L40,2"
            />
          </svg>
        </div>
      </div>
      <div className="ornate-border-row-b">
        <div className="ornate-border-col-a"></div>
        <div className="ornate-border-col-b"></div>
        <div className="ornate-border-col-c"></div>
      </div>
      <div className="ornate-border-row-c">
        <div className="ornate-border-col-a">
          <svg width="40" height="40">
            <path
              fill="none"
              stroke="#000000"
              strokeWidth="4"
              strokeLinejoin="miter"
              strokeMiterlimit="8.0"
              transform="rotate(270,20,20)"
              d="M2,40 L2,16 C11,34 11,11 11,11 C34,11 16,2 16,2 L40,2"
            />
          </svg>
        </div>
        <div className="ornate-border-col-b"></div>
        <div className="ornate-border-col-c">
          <svg width="40" height="40">
            <path
              fill="none"
              stroke="#000000"
              strokeWidth="4"
              strokeLinejoin="miter"
              strokeMiterlimit="8.0"
              transform="rotate(180,20,20)"
              d="M2,40 L2,16 C11,34 11,11 11,11 C34,11 16,2 16,2 L40,2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
