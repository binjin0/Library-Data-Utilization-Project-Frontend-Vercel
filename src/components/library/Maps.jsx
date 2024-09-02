import React, { useEffect, useState } from "react";
import { fetchLibraries } from "../../api/LibraryAPI";
import { Map, MapMarker, MarkerClusterer, Circle } from "react-kakao-maps-sdk";
import InfoModal from "./InfoModal";
import CurrentMarker from "../../assets/MyMarker.png";
import LibraryMarker from "../../assets/LibraryMarker.png";
import { useRecoilState } from "recoil";
import { LibraryAtom } from "../../recoil/LibraryAtom";
import { FaLocationCrosshairs } from "react-icons/fa6";
import styled from "styled-components";

// 좌표 간 거리를 계산하는 함수 (단위: 미터)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3; // 지구 반지름 (미터)
  const rad = (deg) => (deg * Math.PI) / 180;
  const φ1 = rad(lat1);
  const φ2 = rad(lat2);
  const Δφ = rad(lat2 - lat1);
  const Δλ = rad(lng2 - lng1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // 거리 (미터)
};

const Maps = () => {
  const [libraries, setLibraries] = useState([]);
  const [selectedLibrary, setSelectedLibrary] = useState(null); // 선택된 도서관 정보
  const [currentPosition, setCurrentPosition] = useState(null);
  const [mapLevel, setMapLevel] = useState(10);
  const [library, setLibrary] = useRecoilState(LibraryAtom);
  const [map, setMap] = useState(null);
  // 필터링을 위한 거리 제한 (예: 3km)
  const distanceLimit = 5000;

  useEffect(() => {
    const loadLibraries = async () => {
      try {
        const res = await fetch("/api/library");
        const data = await res.json();
        console.log("도서관 위치:", data);
        setLibrary(data.SeoulPublicLibraryInfo.row);

        setLibraries(data.SeoulPublicLibraryInfo.row || []);
      } catch (error) {
        console.error("Error loading libraries:", error);
      }
      // };
      // try {
      //   const res = await fetch("/api/library");
      //   const data = await res.json();
      //   console.log(data, "도서관 위치");
      //   setLibraries(data.SeoulPublicLibraryInfo.row || []);
      // } catch (error) {
      //   console.error("Error fetching data:", error);
      // }
    };

    loadLibraries();

    // 테스트용으로 서울의 좌표를 현재 위치로 설정
    // setCurrentPosition({
    //   lat: 37.6876674374375,
    //   lng: 127.044019937677,
    // });

    // 사용자 현재 위치 가져오기

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting current position:", error);
      }
    );
  }, []);

  // 가까운 도서관만 필터링하는 함수
  const filteredLibraries = library.filter((lib) => {
    if (!currentPosition) return false;
    const distance = calculateDistance(
      currentPosition.lat,
      currentPosition.lng,
      lib.XCNTS,
      lib.YDNTS
    );
    return distance <= distanceLimit; // distanceLimit 미터 이내의 도서관만 포함
  });

  const handleMarkerClick = (library) => {
    setSelectedLibrary(library); // 선택된 도서관 정보를 설정하고 모달 열기
  };

  const handleCloseModal = () => {
    setSelectedLibrary(null); // 모달 닫기
  };
  // 위치로 이동하는 함수
  const moveToCurrentLocation = () => {
    if (currentPosition && map) {
      map.panTo(
        new kakao.maps.LatLng(currentPosition.lat, currentPosition.lng)
      );
    }
  };
  return (
    <Container style={{ width: "100%", height: "100%" }}>
      <Map
        center={
          currentPosition
            ? { lat: currentPosition.lat, lng: currentPosition.lng }
            : { lat: 37.514575, lng: 127.0495556 }
        }
        style={{ width: "100%", height: "85vh", position: "relative" }}
        level={mapLevel}
        onZoomChanged={(map) => setMapLevel(map.getLevel())}
        onCreate={setMap}
      >
        <MarkerClusterer averageCenter={true} minLevel={10}>
          {library.map((lib) => (
            <div key={lib.LBRRY_SEQ_NO}>
              <MapMarker
                position={{ lat: lib.XCNTS, lng: lib.YDNTS }}
                onClick={() => handleMarkerClick(lib)} // 마커 클릭 시 모달 열기
                clickable={true}
                image={{
                  src: LibraryMarker,
                  size: { width: 32, height: 40 },
                }}
              />
              {mapLevel <= 4 && (
                <Circle
                  center={{
                    lat: lib.XCNTS,
                    lng: lib.YDNTS,
                  }}
                  radius={100}
                  strokeWeight={1} // 선의 두께
                  strokeColor={"#5479EE"} // 선의 색깔
                  strokeOpacity={1} // 선의 불투명도
                  strokeStyle={"solid"} // 선의 스타일
                  fillColor={"#CFE7FF"} // 채우기 색깔
                  fillOpacity={0.5} // 채우기 불투명도
                />
              )}
            </div>
          ))}
        </MarkerClusterer>
        {/* 현재 위치 표시 */}

        {currentPosition && (
          <div>
            <MapMarker
              position={{ lat: currentPosition.lat, lng: currentPosition.lng }}
              image={{
                src: CurrentMarker,
                size: { width: 20, height: 20 },
              }}
            />
          </div>
        )}
      </Map>
      {/* 위치 이동 버튼 */}
      <LocationButton onClick={moveToCurrentLocation}>
        <FaLocationCrosshairs />
      </LocationButton>
      {/* 도서관 정보 모달 표시 */}
      <InfoModal
        isOpen={selectedLibrary !== null}
        onClose={handleCloseModal}
        library={selectedLibrary}
      ></InfoModal>
    </Container>
  );
};

export default Maps;

const Container = styled.div`
  position: relative;
`;
const LocationButton = styled.button`
  position: absolute;
  bottom: 45px;
  left: 10px;
  background-color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 10;
`;
