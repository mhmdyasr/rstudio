/*
 * SessionFind.hpp
 *
 * Copyright (C) 2009-19 by RStudio, PBC
 *
 * Unless you have received this program directly from RStudio pursuant
 * to the terms of a commercial license agreement with RStudio, then
 * this program is licensed to you under the terms of version 3 of the
 * GNU Affero General Public License. This program is distributed WITHOUT
 * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
 * AGPL (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.
 *
 */

#ifndef SESSION_FIND_HPP
#define SESSION_FIND_HPP

#include <shared_core/Error.hpp>
#include <shared_core/json/Json.hpp>

#include <boost/utility.hpp>
#include <boost/regex.hpp>

namespace rstudio {
namespace session {
namespace modules {
namespace find {

core::json::Object findInFilesStateAsJson();

core::Error initialize();

boost::regex getGrepOutputRegex(bool isGitGrep);

boost::regex getColorEncodingRegex(bool isGitGrep);

// helper class used to process file replacements
class Replacer : public boost::noncopyable
{
public:
   explicit Replacer(bool ignoreCase) :
      ignoreCase_(ignoreCase)
   {
   }

   void replaceLiteral(size_t matchOn, size_t matchOff,
                       const std::string& replaceLiteral, std::string* pLine,
                       size_t* pReplaceMatchOff)
   {
      *pLine = pLine->replace(matchOn, (matchOff - matchOn), replaceLiteral);
      *pReplaceMatchOff = matchOn + replaceLiteral.size();
   }

   core::Error replaceRegex(size_t matchOn, size_t matchOff,
                            const std::string& findRegex, const std::string& replaceRegex,
                            std::string* pLine, size_t* pReplaceMatchOff)
  {
     core::Error error;
     if (ignoreCase_)
        error = replaceRegexIgnoreCase(matchOn, matchOff, findRegex, replaceRegex, pLine,
                                       pReplaceMatchOff);
     else
        error = replaceRegexWithCase(matchOn, matchOff, findRegex, replaceRegex, pLine,
                                     pReplaceMatchOff);
     return error;
  }

private:
   bool ignoreCase_;
   core::Error completeReplace(const boost::regex& searchRegex, const std::string& replaceRegex,
                               size_t matchOn, size_t matchOff, std::string* pLine,
                               size_t* pReplaceMatchOff);

   core::Error replaceRegexIgnoreCase(size_t matchOn, size_t matchOff,
                                      const std::string& findRegex, const std::string& replaceRegex,
                                      std::string* pLine, size_t* pReplaceMatchOff);

   core::Error replaceRegexWithCase(size_t matchOn, size_t matchOff,
                                    const std::string& findRegex, const std::string& replaceRegex,
                                    std::string* pLine, size_t* pReplaceMatchOff);
};

} // namespace find
} // namespace modules
} // namespace session
} // namespace rstudio

#endif // SESSION_FIND_HPP
