import styles from "./TableOfContents.module.scss";
import { HeaderInformation } from "utils/preprocessMarkdown";
import Collapsible from "components/UI/Collapsible";


function TableOfContents({ sectionHeaders }: { sectionHeaders: HeaderInformation[]; }) {
  return (sectionHeaders.length > 0) ? (
    <Collapsible
      className={styles.tableOfContents}
      header="Table of Contents"
      centered={true}
    >
      <nav>
        {
          sectionHeaders.map(({ level, text }) => (
            <a key={text} href={"#" + text}>
              <p style={{
                marginLeft: `${(level - 1) * 2}em`
              }}>
                &bull; {text}
              </p>
            </a>
          ))
        }
      </nav>
    </Collapsible>
  ) : null;
}

export default TableOfContents;