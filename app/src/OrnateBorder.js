export const OrnateBorder = () => {
  return (
    <div className="ornate-border-container">
      <div className="ornate-border-row-a">
        <div className="ornate-border-col-a">
          <svg>
            <path
              fill="none"
              stroke="#333333"
              stroke-width="4"
              stroke-linejoin="miter"
              stroke-miterlimit="8.0"
              d="M2,40 L2,16 C11,34 11,11 11,11 C34,11 16,2 16,2 L40,2"
            />
          </svg>
        </div>
        <div className="ornate-border-col-b">
          <svg width="100%">
            <polyline
              points="0,2 5000,2"
              fill="none"
              stroke="#000000"
              stroke-width="4"
            />
          </svg>
        </div>
        <div className="ornate-border-col-c">
          <svg>
            <path
              fill="none"
              stroke="#333333"
              stroke-width="4"
              stroke-linejoin="miter"
              stroke-miterlimit="8.0"
              transform="rotate(90,20,20)"
              d="M2,40 L2,16 C11,34 11,11 11,11 C34,11 16,2 16,2 L40,2"
            />
          </svg>
        </div>
      </div>
      <div className="ornate-border-row-b">
        <div className="ornate-border-col-a">
          <svg height="100%">
            <polyline
              points="2,0 2,20000"
              fill="none"
              stroke="#000000"
              stroke-width="4"
            />
          </svg>
        </div>
        <div className="ornate-border-col-b"></div>
        <div className="ornate-border-col-c">
          <svg height="100%">
            <polyline
              points="38,0 38,20000"
              fill="none"
              stroke="#000000"
              stroke-width="4"
            />
          </svg>
        </div>
      </div>
      <div className="ornate-border-row-c">
        <div className="ornate-border-col-a">
          <svg>
            <path
              fill="none"
              stroke="#333333"
              stroke-width="4"
              stroke-linejoin="miter"
              stroke-miterlimit="8.0"
              transform="rotate(270,20,20)"
              d="M2,40 L2,16 C11,34 11,11 11,11 C34,11 16,2 16,2 L40,2"
            />
          </svg>
        </div>
        <div className="ornate-border-col-b">
          <svg width="100%">
            <polyline
              points="0,38 5000,38"
              fill="none"
              stroke="#000000"
              stroke-width="4"
            />
          </svg>
        </div>
        <div className="ornate-border-col-c">
          <svg>
            <path
              fill="none"
              stroke="#333333"
              stroke-width="4"
              stroke-linejoin="miter"
              stroke-miterlimit="8.0"
              transform="rotate(180,20,20)"
              d="M2,40 L2,16 C11,34 11,11 11,11 C34,11 16,2 16,2 L40,2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
