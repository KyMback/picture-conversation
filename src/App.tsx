import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { AppStore } from "./stores/AppStore";

export const App = observer(() => {
  const [store] = useState(new AppStore());

  useEffect(() => store.dispose, [store]);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <img width={300} src={store.filePath} alt={"Image"} />
        <input type="file" onChange={(e) => store.setFile(e.target.files)} />
      </div>
      <div>
        <textarea
          onChange={(e) => store.setText(e.target.value)}
          value={store.text}
        />
        <div>
          {store.currentBytesCount} / {"N/A"}
        </div>
        <div>
          <button onClick={store.encode}>Encode</button>
          <button onClick={store.decode}>Decode</button>
        </div>
      </div>
    </div>
  );
});
