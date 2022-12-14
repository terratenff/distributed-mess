package org.tt.front;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping(value = "")
public class GeneralController {
    private static Logger logger = LoggerFactory.getLogger(GeneralController.class);

    @RequestMapping("/")
    public String index(final HttpServletRequest request) {
        logger.info("INDEX");

        ModelAndView mav = new ModelAndView();

        return "hello";
    }

    @RequestMapping("/a")
    public String page(final HttpServletRequest request) {
        return "page";
    }
}
