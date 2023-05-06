const { createClient } = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const multer = require("multer");
const app = express();
var cors = require("cors");
const path = require("path");
const uuid = require("uuid");

// using morgan for logs
app.use(morgan("combined"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
});

const supabase = createClient(URL_SUPABASE, API_KEY_SUPABASE);

const urlPublic = `${URL_SUPABASE}/storage/v1/object/public/foto_menu/`;

app.get("/food_menu", async (req, res) => {
  const { data, error } = await supabase.from("food_menu").select();

  if (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }

  const resultData = data.map((item) => {
    return {
      ...item,
      image_url: `${urlPublic}${item["image"]}`,
    };
  });

  res.json({
    success: true,
    message: "Berhasil",
    data: resultData,
  });
});

app.get("/food_menu/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("food_menu")
    .select()
    .eq("id", req.params.id);

  if (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
  if (data.length > 0) {
    res.json({
      success: true,
      message: "Berhasil",
      data: {
        ...data[0],
        image_url: `${urlPublic}${data[0]["image"]}`,
      },
    });
  } else {
    res.json({
      success: false,
      message: "Data tidak ditemukan",
    });
  }
});

app.post("/food_menu", upload.single("image"), async (req, res) => {
  const file = req.file;

  const id = uuid.v4();

  var body = {
    name: req.body.name,
    price: req.body.price,
    id: id,
  };

  if (file) {
    const fileExt = path.extname(file.originalname);
    const { data, error: errorUpload } = await supabase.storage
      .from("foto_menu")
      .upload(id + fileExt, file.buffer);

    if (errorUpload) {
      res.json({
        success: false,
        message: errorUpload.message,
      });
    }

    body = {
      ...body,
      image: data.path,
    };
  }

  const { error } = await supabase.from("food_menu").insert(body);

  if (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }

  res.json({
    success: true,
    message: "Berhasil",
  });
});

app.put("/food_menu/:id", upload.single("image"), async (req, res) => {
  const file = req.file;
  const id = req.params.id;

  var body = {
    name: req.body.name,
    price: req.body.price,
  };

  if (file) {
    const fileExt = path.extname(file.originalname);
    const { data, error: errorUpload } = await supabase.storage
      .from("foto_menu")
      .update(id + fileExt, file.buffer);

    if (errorUpload) {
      res.json({
        success: false,
        message: errorUpload.message,
      });
    }

    body = {
      ...body,
      image: data.path,
    };
  }

  console.log(id, body);

  const { error } = await supabase.from("food_menu").update(body).eq("id", id);
  if (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
  res.json({
    success: true,
    message: "Berhasil",
  });
});

app.delete("/food_menu/:id", async (req, res) => {
  const { data } = await supabase
    .from("food_menu")
    .select("*")
    .eq("id", req.params.id);

  if (data.length == 0) {
    res.json({
      success: false,
      message: error.message,
    });
  } else {
    const { error } = await supabase
      .from("food_menu")
      .delete()
      .eq("id", req.params.id);

    const { error: errorFile } = await supabase.storage
      .from("food_menu")
      .remove(data[0]["image"]);

    if (error) {
      res.json({
        success: false,
        message: error.message,
      });
    }

    if (errorFile) {
      res.json({
        success: false,
        message: errorFile.message,
      });
    }
  }
  res.json({
    success: true,
    message: "Berhasil",
  });
});

app.get("/", (req, res) => {
  res.json({
    Hello: "I Love You",
  });
});

app.listen(8000, () => {
  console.log(`> Ready on http://localhost:8000`);
});
