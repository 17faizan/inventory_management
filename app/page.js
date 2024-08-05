"use client";

import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import {
  Box,
  Modal,
  Typography,
  Stack,
  TextField,
  Button,
  InputBase,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { collection, deleteDoc, getDocs, doc, query, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      color: "#333",
    },
    h6: {
      fontSize: "1.2rem",
      fontWeight: 500,
    },
  },
});

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [itemName, setItemName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentItem, setCurrentItem] = useState(null);
  const [description, setDescription] = useState("");

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 }, { merge: true });
    } else {
      await setDoc(docRef, { quantity: 1, description: "" });
    }

    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 }, { merge: true });
      }
    }
    await updateInventory();
  };

  const editDescription = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item.name);
    await updateDoc(docRef, { description });
    await updateInventory();
    handleCloseEdit();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => setOpenAdd(false);
  const handleOpenEdit = (item) => {
    setCurrentItem(item);
    setDescription(item.description || "");
    setOpenEdit(true);
  };
  const handleCloseEdit = () => setOpenEdit(false);

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const chartData = {
    labels: inventory.map((item) => capitalizeFirstLetter(item.name)),
    datasets: [
      {
        label: "Quantity",
        data: inventory.map((item) => item.quantity),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        minHeight="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
        sx={{ padding: 2, backgroundColor: "#f9f9f9" }}
      >
        <Typography variant="h1" mb={4}>
          Inventory Tracker
        </Typography>
        <Modal open={openAdd} onClose={handleCloseAdd}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="background.paper"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{ transform: "translate(-50%,-50%)", borderRadius: 1 }}
          >
            <Typography variant="h6">Add Item</Typography>
            <Stack width="100%" direction="row" spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value);
                }}
              ></TextField>
              <Button
                variant="outlined"
                onClick={() => {
                  addItem(itemName);
                  setItemName("");
                  handleCloseAdd();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Modal open={openEdit} onClose={handleCloseEdit}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="background.paper"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{ transform: "translate(-50%,-50%)", borderRadius: 1 }}
          >
            <Typography variant="h6">Edit Description</Typography>
            <TextField
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            ></TextField>
            <Button
              variant="outlined"
              onClick={() => {
                editDescription(currentItem);
              }}
            >
              Save
            </Button>
          </Box>
        </Modal>
        <Box width="800px">
          <Typography variant="h6" mb={1}>
            Search Bar
          </Typography>
          <InputBase
            placeholder="Search items..."
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              mb: 2,
              border: "1px solid black",
              borderRadius: 1,
              padding: 1,
              backgroundColor: "white",
            }}
          />
        </Box>
        <Button
          variant="contained"
          onClick={() => {
            handleOpenAdd();
          }}
        >
          Add New Item
        </Button>
        <Box border="1px solid #333" borderRadius={1} overflow="hidden" width="800px">
          <Box
            width="100%"
            height="100px"
            bgcolor="primary.main"
            alignItems="center"
            display="flex"
            justifyContent="center"
          >
            <Typography variant="h2" color="primary.contrastText">
              Inventory Items
            </Typography>
          </Box>
          <Stack
            width="100%"
            maxHeight="300px"
            spacing={2}
            overflow="auto"
            sx={{ padding: 2, backgroundColor: "white" }}
          >
            {filteredInventory.map((item) => (
              <Box
                key={item.name}
                width="100%"
                minHeight="150px"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  backgroundColor: "#f0f0f0",
                  padding: 2,
                  borderRadius: 1,
                }}
              >
                <Box>
                  <Typography variant="h3" color="text.primary" textAlign="center">
                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {item.description || "No description available"}
                  </Typography>
                </Box>
                <Typography variant="h3" color="text.primary" textAlign="center">
                  {item.quantity}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      addItem(item.name);
                    }}
                  >
                    Add
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                      removeItem(item.name);
                    }}
                  >
                    Remove
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      handleOpenEdit(item);
                    }}
                  >
                    Edit Description
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
        <Box width="800px" height="400px" mt={4}>
          <Typography variant="h6" mb={1}>
            Inventory Quantities
          </Typography>
          <Box height="100%" width="100%">
            <Bar data={chartData} options={chartOptions} />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
