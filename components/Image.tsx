import * as React from "react";

export function Image({ src }) {
  console.log(src);
  //   return (
  //     <div className="image">
  //       <img src={url} />
  //       <style jsx>
  //         {`
  //           .image {
  //             width: 200px;
  //             display: flex;
  //             flex-direction: column;
  //             padding: 12px 16px;
  //             background: #f6f9fc;
  //             border: 1px solid #dce6e9;
  //             border-radius: 4px;
  //           }
  //           .image :global(p) {
  //             margin: 0;
  //           }
  //         `}
  //       </style>
  //     </div>
  //   );
  return React.createElement(`img`, {
    src,
    className: "profile-picture",
  });
}
