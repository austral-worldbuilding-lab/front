import {
  buildMandalaHistoryQuery,
  parseMandalaHistory,
} from "@/utils/mandalaHistory";
import { useLocation, useNavigate } from "react-router-dom";

export const useMandalaBreadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const goToMandala = (characterId: string, characterName: string) => {
    const { ids, names } = parseMandalaHistory(location.search);

    const newIds = [...ids, characterId];
    const newNames = [...names, characterName];
    const search = buildMandalaHistoryQuery(newIds, newNames);

    const basePath = location.pathname.split("/").slice(0, -1).join("/");
    navigate(`${basePath}/${characterId}?${search}`);
  };

  return { goToMandala };
};
