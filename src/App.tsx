import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { AppStore } from "stores/AppStore";

export const App = observer(() => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [store] = useState(new AppStore(ref));

  useEffect(() => store.dispose, [store]);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <canvas ref={ref} style={{ width: "300px" }} />
        <input type="file" onChange={(e) => store.setFile(e.target.files)} />
      </div>
      <div>
        <textarea
          onChange={(e) => store.setText(e.target.value)}
          value={store.text}
        />
        <div>
          {store.currentBytesCount} / {store.maxDataBytesCount}
        </div>
        <div>
          <button onClick={store.encode}>Encode</button>
        </div>
      </div>
    </div>
  );
});
