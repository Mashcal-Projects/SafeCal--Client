import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  LayersControl,
  LayerGroup,
} from "react-leaflet";
import "leaflet.heat";
import { AimOutlined } from "@ant-design/icons";
import { useReport } from "../context/ReportContext";
import bluePinIconImage from "../assets/bluepin.png"; // Adjust the path as needed

import { FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

import "../styling/map.scss";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { useAuth } from "../context/AuthContext";
import { LoaderComp } from "./loader";

export const MapComp = () => {
  const { reports, setFilteredReports, loading, addresses } = useReport();
  const [mapCenter, setMapCenter] = useState(null);
  const [mapPolygons, setMapPolygons] = useState([]); // Store all polygons
  const { isLoggedIn } = useAuth();
  const [showLoader, setShowLoader] = useState(true);

  const calculateCenter = (locations) => {
    const totalLat = locations.reduce((sum, loc) => sum + loc.latitude, 0);
    const totalLon = locations.reduce((sum, loc) => sum + loc.longitude, 0);
    return [totalLat / locations.length, totalLon / locations.length];
  };
  const [isMobile, setIsMobile] = useState(false);


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    handleResize();

    // Add event listener for resize
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Only run once on mount

  useEffect(() => {
    if (!loading && reports.length > 0) {
      const center = calculateCenter(reports);
      setMapCenter(center);
      setShowLoader(false); // Hide loader once center is calculated
    }
  }, [loading, reports]);

  if (showLoader) {
    return <LoaderComp />;
  }

  if (loading) return <p>Loading map...</p>; // Optional loading indicator

  // Function to create a button inside the main map component
  function CenterButton() {
    const map = useMap();

    const handleCenterMap = () => {
      map.setView(mapCenter, 15);
    };

    return (
      <div className="center-button" onClick={handleCenterMap}>
        <AimOutlined style={{ fontSize: "20px" }} />
      </div>
    );
  }

  function HeatLayer({ data }) {
    const map = useMap();
    const heatLayerRef = useRef(null);

    useEffect(() => {
      const heatData = data.map((report) => [
        report.latitude,
        report.longitude,
        0.2, // Adjust intensity based on report importance (0.2 is a mild heat level)
      ]);
      // Initialize the heat layer but do not add it to the map by default
      heatLayerRef.current = window.L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 15,
        gradient: { 0.4: "green", 0.65: "yellow", 1: "red" },
      });

      return () => {
        // Cleanup: remove the heat layer when the component unmounts
        if (map.hasLayer(heatLayerRef.current)) {
          map.removeLayer(heatLayerRef.current);
        }
      };
    }, [data, map]);

    useEffect(() => {
      // Add or remove the heat layer based on the overlay's checked state
      map.on("overlayadd", (e) => {
        if (e.name === "Heat Layer") {
          heatLayerRef.current.addTo(map);
        }
      });

      map.on("overlayremove", (e) => {
        if (e.name === "Heat Layer") {
          map.removeLayer(heatLayerRef.current);
        }
      });
    }, [map]);

    return null; // This component doesn’t render anything directly
  }

  const bluePinIcon = new L.Icon({
    iconUrl: bluePinIconImage,
    iconSize: [25, 40], // Slightly taller for a pin
    iconAnchor: [12, 40], // Matches the bottom tip of the pin
    popupAnchor: [0, -40], // Adjust popup position if needed

    // iconUrl: redPinIconImage,
    // iconSize: [30, 40], // Scale down the size (adjust as necessary)
    // iconAnchor: [15, 40], // Align anchor to the bottom-center of the pin
    // popupAnchor: [0, -40], // Place popup above the icon
  });

  const handleDrawCreated = (event) => {
    console.log("create", event);

    const { layerType, layer } = event;
    if (layerType === "polygon") {
      // Get polygon coordinates
      const polygonBounds = layer.getBounds(); // Get bounding box of the polygon
      console.log("polygonBounds", polygonBounds);
      // Update mapPolygons
      setMapPolygons((prevPolygons) => {
        const newPolygons = [...prevPolygons, polygonBounds];
        console.log("Updated mapPolygons:", newPolygons);

        // Filter reports that are within any of the polygons
        const filtered = reports.filter((report) => {
          const markerLatLng = L.latLng(report.latitude, report.longitude);
          return newPolygons.some((bounds) => bounds.contains(markerLatLng));
        });

        // Defer setting filteredReports to avoid nested updates
        setTimeout(() => {
          setFilteredReports(filtered);
        }, 0);
        return newPolygons;
      });
    }
    // console.log("filteredReports", filteredReports);
  };
  const handleEdit = (event) => {
    console.log("edit", event);

    const {
      layers: { _layers },
    } = event;

    // Validate that _layers is defined and contains layers
    if (!_layers || Object.keys(_layers).length === 0) {
      console.warn("No layers to edit");
      return;
    }

    // Update mapPolygons with edited layers
    setMapPolygons((prevPolygons) => {
      // Create a new array of polygons, replacing the edited polygons
      const updatedPolygons = prevPolygons.map((polygon) => {
        const polygonCenter = polygon.getCenter
          ? polygon.getCenter()
          : polygon.getBounds().getCenter();

        const editedLayer = Object.values(_layers).find((layer) => {
          const layerCenter = layer.getBounds().getCenter();
          return polygonCenter.equals(layerCenter);
        });

        // Replace the polygon with the edited bounds if it matches
        return editedLayer ? editedLayer.getBounds() : polygon;
      });

      console.log("Updated mapPolygons after edit:", updatedPolygons);

      // Filter reports based on the updated polygons
      const filtered = reports.filter((report) => {
        const markerLatLng = L.latLng(report.latitude, report.longitude);
        return updatedPolygons.some((bounds) => bounds.contains(markerLatLng));
      });

      console.log("filtered", filtered);

      // Update filteredReports state
      setTimeout(() => {
        setFilteredReports(filtered);
      }, 0);

      return updatedPolygons;
    });
  };

  const handleDelete = (event) => {
    console.log("delete", event);

    const {
      layers: { _layers },
    } = event;

    // Get IDs of layers being deleted
    const deletedLayerIds = Object.keys(_layers);

    // Update mapPolygons to remove deleted polygons
    setMapPolygons((prevPolygons) => {
      const remainingPolygons = prevPolygons.filter((polygon) => {
        // Check if the polygon corresponds to any of the deleted layers
        const polygonCenter = polygon.getCenter
          ? polygon.getCenter()
          : polygon.getBounds().getCenter();
        return !deletedLayerIds.some((id) => {
          const deletedLayer = _layers[id];
          return deletedLayer.getBounds().getCenter().equals(polygonCenter);
        });
      });

      console.log("Updated mapPolygons after delete:", remainingPolygons);

      // Update filteredReports based on remaining polygons
      const filtered =
        remainingPolygons.length === 0
          ? reports // Reset to all reports if no polygons remain
          : reports.filter((report) => {
              const markerLatLng = L.latLng(report.latitude, report.longitude);
              return remainingPolygons.some((bounds) =>
                bounds.contains(markerLatLng)
              );
            });

      console.log("filtered", filtered);

      setTimeout(() => {
        setFilteredReports(filtered);
      }, 0);

      return remainingPolygons;
    });
  };




  return (
    <div className="map-wrapper">
      {mapCenter && (
        <MapContainer
          center={mapCenter}
          zoom={15}
          style={{
            height: isMobile ? "58vh" : "95vh",
            width: "100%",
            borderRadius: isMobile ? "10px" : "20px",
          }}

        >
          <LayersControl position="bottomleft">
            {/* Base Layer */}
            <LayersControl.BaseLayer checked name="Waze">
              <TileLayer
                url="https://il-livemap-tiles3.waze.com/tiles/{z}/{x}/{y}.png"
                attribution="&copy; Waze"
              />
            </LayersControl.BaseLayer>

            {/* Additional Base Layer */}
            <LayersControl.BaseLayer name="OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
            </LayersControl.BaseLayer>

            {/* Heat Layer as an Overlay with Checkbox */}
            <LayersControl.Overlay name="Heat Layer">
              <LayerGroup>
                <HeatLayer data={reports} />
              </LayerGroup>
            </LayersControl.Overlay>

            {/* Markers as an Overlay with Checkbox */}
            <LayersControl.Overlay checked name="Show Markers">
              <LayerGroup>
                {reports &&
                  reports.map((report) => (
                    <Marker
                      key={
                        report._id || `${report.latitude}-${report.longitude}`
                      }
                      position={[report.latitude, report.longitude]}
                      icon={bluePinIcon}
                    >
                      <Popup>
                        {addresses[[report.latitude, report.longitude]]}
                        <img
                          src={`http://localhost:5000${report.image}`}
                          alt="Report"
                          style={{
                            width: "100%",
                            height: "auto",
                            borderRadius: "8px",
                            marginBottom: "8px",
                          }}
                        />
                      </Popup>
                    </Marker>
                  ))}
              </LayerGroup>
            </LayersControl.Overlay>
          </LayersControl>

          {isLoggedIn && (
            <FeatureGroup>
              <EditControl
                position="topright"
                onCreated={handleDrawCreated}
                onEdited={handleEdit}
                onDeleted={handleDelete}
                draw={{
                  rectangle: false,
                  circle: false,
                  circlemarker: false,
                  marker: false,
                  polyline: false,
                  polygon: true, // Enable polygons
                }}
              />
            </FeatureGroup>
          )}
          <CenterButton />
        </MapContainer>
      )}
    </div>
  );
};
