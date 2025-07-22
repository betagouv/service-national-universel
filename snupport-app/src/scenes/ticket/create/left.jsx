import React from "react";

import TagsEditor from "../../../components/TagEditor";

export default ({ tags, setTags, user }) => {
  return (
    <div className={`flex ${user.role === "AGENT" ? "w-[378px]" : "w-[257px]"} flex-none flex-col border-r border-light-grey bg-gray-50 p-8 pt-5`}>
      {user.role === "AGENT" && <TagsEditor name="Etiquettes" tags={tags} setTags={setTags} />}
    </div>
  );
};
