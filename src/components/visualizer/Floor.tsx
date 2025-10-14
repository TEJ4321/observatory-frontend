import React from "react";
import { Text } from "@react-three/drei";

interface FloorProps {
  size: number;
}

export const Floor = ({ size }: FloorProps) => (
  <>
    <gridHelper
      args={[size, size / 2, "#444", "#888"]}
      position={[0, 0.1, 0]}
    />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial
        color="#333"
        metalness={0.5}
        roughness={0.6}
        receiveShadow
      />
    </mesh>
    <Text
      position={[0, 0.02, -size / 2 + 1]}
      fontSize={size / 20}
      color="#fbbf24"
    >
      N
    </Text>
    <Text
      position={[0, 0.02, size / 2 - 1]}
      fontSize={size / 20}
      color="#fbbf24"
      rotation={[0, Math.PI, 0]}
    >
      S
    </Text>
    <Text
      position={[size / 2 - 1, 0.02, 0]}
      fontSize={size / 20}
      color="#fbbf24"
      rotation={[0, -Math.PI / 2, 0]}
    >
      E
    </Text>
    <Text
      position={[-size / 2 + 1, 0.02, 0]}
      fontSize={size / 20}
      color="#fbbf24"
      rotation={[0, Math.PI / 2, 0]}
    >
      W
    </Text>
  </>
);